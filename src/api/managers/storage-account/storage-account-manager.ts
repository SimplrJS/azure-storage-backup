import * as fs from "fs-extra";
import * as path from "path";
import * as Progress from "progress";
import { tmpdir, EOL } from "os";
import { Logger, createBlobService, BlobService } from "azure-storage";

import {
    ConfigData,
    BlobsList,
    BlobContext,
    ProgressTokens,
    ContainerItemsList,
    ContainersList,
    ContainersDownloadedBlobsResult,
    ContainerDownloadedBlobsResult
} from "./storage-account-contracts";
import { ContainerManager } from "../container-manager";
import { BlobManager } from "../blob-manager";
import { AsyncManager, PromiseHandler, AsyncSessionResultDto } from "../../promises/async-manager";

import {
    GetServiceProperties,
    GetLocalFilesList,
    FilterMissingBlobsList,
    GetBlobToStream
} from "../../helpers/blob-helpers";
import { BlobDownloadDto } from "../../contracts/blob-helpers-contracts";
import { PACKAGE_JSON } from "../../../cli/cli-helpers";

const LOG_LEVELS = Logger.LogLevels;

export class StorageAccountManager {
    constructor(
        private config: ConfigData,
        private logger: Logger,
        private noCache: boolean = false,
        private showProgress: boolean = true
    ) {
        this.blobService = createBlobService(this.config.storageAccount, this.config.storageAccessKey, this.config.storageHost);
        this.containersManager = new ContainerManager(this.blobService);
    }

    // #region Private variables
    private blobService: BlobService;
    private containersManager: ContainerManager;

    private readonly progressFormat: string = "[:bar] :percent :current / :total :elapsed seconds elapsed. " +
        ":eta seconds left. (:logLevel) :lastActionTitle";
    private readonly progressWidth: number = 20;

    private progress: Progress | undefined;
    // #endregion Private variables

    // #region Storage account actions
    public async CheckServiceStatus(): Promise<void> {
        try {
            this.logger.info(`Checking service connectivity with storage account "${this.config.storageAccount}".`);
            await GetServiceProperties(this.blobService);
            this.logger.notice(`Successfully connected to storage account "${this.config.storageAccount}".`);
        } catch (error) {
            this.logger.critical(`Failed to connect to storage account "${this.config.storageAccount}".`);
            throw error;
        }
    }

    public async FetchAllContainers(): Promise<BlobService.ContainerResult[]> {
        if (!this.noCache) {
            try {
                this.logAction(LOG_LEVELS.INFO, `Searching for ${this.config.storageAccount} containers list in cache.`);
                const cachedBlobsList = await this.GetCachedContainersList();
                this.logAction(LOG_LEVELS.NOTICE, `"${this.config.storageAccount}" containers list fetched from cache.`);
                return cachedBlobsList.Entries;
            } catch (error) {
                this.logAction(
                    LOG_LEVELS.ERROR,
                    `Failed to get cached containers list for storage account "${this.config.storageAccount}".`
                );
            }
        }

        try {
            this.logger.info(`Fetching all containers from storage account "${this.config.storageAccount}".`);
            const containersList = await this.containersManager.FetchAll();
            this.logger.notice(`Fetched ${this.containersManager.Entries.length} container objects` +
                ` from storage account "${this.config.storageAccount}".`);

            this.logAction(LOG_LEVELS.INFO, `Caching ${containersList.length} "${this.config.storageAccount}" containers list entries.`);
            await this.saveContainersList(containersList);
            this.logger.notice(`${containersList.length} ${this.config.storageAccount} containers entries cached.`);

            return containersList;
        } catch (error) {
            this.logger.alert(`Failed to fetch containers list of a storage account "${this.config.storageAccount}". ${EOL} ${error}}`);
            throw error;
        }
    }

    // #region BlobsLists
    public async FetchContainersBlobsList(): Promise<AsyncSessionResultDto<BlobService.ContainerResult, BlobService.BlobResult[]>> {
        try {
            const containersList = await this.FetchAllContainers();
            this.logger.notice(`Fetching blobs list from ${containersList.length} containers.`);
            const asyncManager = new AsyncManager<BlobService.ContainerResult, BlobService.BlobResult[]>(this.blobsListFetchHandler);

            if (this.showProgress) {
                this.progress = new Progress(this.progressFormat, {
                    total: containersList.length,
                    width: this.progressWidth
                });

                asyncManager.OnSinglePromiseFinished = () => {
                    this.progressTick();
                };
            }

            this.progress = undefined;
            const result = await asyncManager.Start(containersList);
            this.logger.notice(`Fetched blobs list from ${containersList.length} containers.`);
            return result;
        } catch (error) {
            this.logger.alert(`Failed to fetch blobs list from ${this.config.storageAccount} containers.`);
            return { Failed: [], Succeeded: [] };
        }
    }

    public async FetchContainerBlobsList(containerName: string): Promise<BlobService.BlobResult[]> {
        let blobsList: BlobService.BlobResult[] | undefined;
        // Searching for container's blob list in cache
        if (!this.noCache) {
            try {
                this.logAction(LOG_LEVELS.INFO, "Searching for container's blob list in cache.");
                const cachedBlobsList = await this.GetContainerCachedBlobsList(containerName);
                this.logAction(LOG_LEVELS.INFO, `"${containerName}" container's blob list fetched from cache.`);
                blobsList = cachedBlobsList.Entries;
            } catch (error) {
                this.logAction(LOG_LEVELS.ERROR, `Failed to get cached blob list for container "${containerName}".`);
            }
        }

        // Getting container's list from Azure.
        if (blobsList == null) {
            const blobManager = new BlobManager(this.blobService, containerName);
            this.logAction(LOG_LEVELS.INFO, `Fetching blobs list of "${containerName}" from Azure.`);
            try {
                blobsList = await blobManager.FetchAll();
                this.logAction(LOG_LEVELS.INFO, `"${containerName}" blobs list fetched successfully."`);
                await this.saveBlobsList(containerName, blobsList);
            } catch (error) {
                this.logAction(LOG_LEVELS.ERROR, `Failed to fetch blobs list of ${containerName} from Azure.`);
                throw error;
            }
        }

        return blobsList;
    }
    // #endregion Blobs Lists

    // #region Files validation
    public async ValidateContainerFiles(containerName: string, clearCache: boolean = false): Promise<BlobService.BlobResult[]> {
        this.logAction(LOG_LEVELS.INFO, `Validating "${containerName}" downloaded files with blobs list.`);

        const downloadsListPath = this.GetContainerDownloadsListPath(containerName);

        if (!this.noCache) {
            try {
                this.logAction(LOG_LEVELS.INFO, `Getting cached "${containerName}" downloads list.`);
                const cachedDownloadsList = await fs.readJson(downloadsListPath) as BlobsList;
                if (cachedDownloadsList != null) {
                    this.logAction(LOG_LEVELS.INFO, `"${containerName}" cached downloads list found.`);

                    if (clearCache) {
                        await fs.remove(downloadsListPath);
                    }

                    this.outputDownloadsListNotification(cachedDownloadsList.Entries.length, containerName);

                    return cachedDownloadsList.Entries;
                } else {
                    // If empty file found, remove it.
                    await fs.remove(downloadsListPath);
                    throw new Error("No content in cached file");
                }
            } catch (error) {
                this.logAction(LOG_LEVELS.WARNING, `Failed to get cached "${containerName}" container downloads list.`);
            }
        }

        // Get cached blob-list by container
        const blobsList = await this.FetchContainerBlobsList(containerName);

        this.logAction(LOG_LEVELS.INFO, `Getting "${containerName}" downloaded files list.`);
        const containerSourcePath = this.GetContainerDownloadsDestinationPath(containerName);
        const localFilesList = await GetLocalFilesList(containerSourcePath);
        this.logAction(LOG_LEVELS.INFO, `"${containerName}" downloaded files list successfully fetched.`);

        // Filtering missing blobs
        let downloadsList = new Array<BlobService.BlobResult>();
        if (localFilesList.length > 0) {
            downloadsList = FilterMissingBlobsList(blobsList, localFilesList);
        } else {
            downloadsList = blobsList;
        }

        if (clearCache) {
            await fs.remove(downloadsListPath);
        } else {
            // Save checked list in temp folder. "/tmpdir/{package-name}/{azure-storage-account}/{container-name}/check-list.json"
            await this.saveContainerDownloadsList(containerName, downloadsList);
        }

        this.outputDownloadsListNotification(downloadsList.length, containerName);

        return downloadsList;
    }

    public async ValidateContainersFiles(): Promise<Array<ContainerItemsList<BlobService.BlobResult>>> {
        // Get blob container list, and check one by one.
        const containers = await this.FetchAllContainers();

        if (this.showProgress) {
            this.progress = new Progress(this.progressFormat, {
                total: containers.length,
                width: this.progressWidth
            });
        }

        const results: Array<ContainerItemsList<BlobService.BlobResult>> = [];

        for (const container of containers) {
            const downloadsList = await this.ValidateContainerFiles(container.name);
            results.push({
                ContainerName: container.name,
                Entries: downloadsList
            });
            this.progressTick();
        }

        this.progress = undefined;

        return results;
    }
    // #endregion Files validation

    // #region Blobs download
    public async DownloadContainerBlobs(containerName: string): Promise<ContainerDownloadedBlobsResult | undefined> {
        const downloadsList = await this.ValidateContainerFiles(containerName, true);

        if (downloadsList.length === 0) {
            // All blobs downloaded
            return undefined;
        }

        const asyncManager = new AsyncManager<BlobService.BlobResult, BlobDownloadDto, BlobContext>(this.downloadBlobsHandler, 5);

        if (this.showProgress) {
            this.progress = new Progress(this.progressFormat, {
                total: downloadsList.length,
                width: this.progressWidth
            });

            asyncManager.OnSinglePromiseFinished = () => {
                this.progressTick();
            };
        }

        const results = await asyncManager.Start(downloadsList, { ContainerName: containerName });

        this.logger.notice(
            `"${containerName}" results: ${results.Succeeded.length} - downloads succeeded; ` +
            `${results.Failed.length} - downloads failed.`
        );

        this.progress = undefined;

        return results;
    }

    public async DownloadContainersBlobs(): Promise<ContainersDownloadedBlobsResult> {
        // Get blob container list, and check one by one.
        const containers = await this.FetchAllContainers();

        const results: ContainersDownloadedBlobsResult = [];

        for (let i = 0; i < containers.length; i++) {
            const containerName = containers[i].name;

            this.logger.notice(`Downloading "${containerName}" blobs. ${i} / ${containers.length} containers finished.`);
            const containerDownloadResults = await this.DownloadContainerBlobs(containerName);

            if (containerDownloadResults != null) {
                results.push(containerDownloadResults);
            } else {
                this.logger.notice(`All container "${containerName}" blobs already downloaded.`);
            }
        }

        return results;
    }

    // #endregion Blobs download

    // #endregion Storage account actions

    // #region Cache control
    private async saveContainersList(entries: BlobService.ContainerResult[]): Promise<void> {
        const containersList: ContainersList = {
            StorageAccount: this.config.storageAccount,
            TimeStamp: Date.now(),
            Entries: entries
        };

        const containersListDirectory = path.parse(this.ContainersListPath).dir;
        await fs.ensureDir(containersListDirectory);
        await fs.writeJSON(this.ContainersListPath, containersList);
    }

    private async saveBlobsList(containerName: string, entries: BlobService.BlobResult[]): Promise<void> {
        this.logAction(LOG_LEVELS.INFO, `Caching ${entries.length} "${containerName}" blob list entries.`);
        const listPath = this.GetContainerBlobsListPath(containerName);
        const directory = path.parse(listPath).dir;

        await fs.ensureDir(directory);

        const blobsList: BlobsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(listPath, blobsList);
        this.logAction(LOG_LEVELS.INFO, `${entries.length} "${containerName}" blob list entries. Successfully cached.`);
    }

    private async saveContainerDownloadsList(containerName: string, entries: BlobService.BlobResult[]): Promise<void> {
        this.logAction(LOG_LEVELS.INFO, `Caching ${entries.length} "${containerName}" missing blobs list entries.`);
        const blobsListPath = this.GetContainerDownloadsListPath(containerName);

        const downloadsList: BlobsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(blobsListPath, downloadsList);
        this.logAction(LOG_LEVELS.INFO, `${entries.length} "${containerName}" missing blobs list entries. Successfully cached.`);
    }

    public async GetContainerCachedBlobsList(containerName: string): Promise<BlobsList> {
        const blobsListPath = this.GetContainerBlobsListPath(containerName);
        return await fs.readJSON(blobsListPath) as BlobsList;
    }

    public async GetCachedContainersList(): Promise<ContainersList> {
        const containersListPath = this.ContainersListPath;
        return await fs.readJSON(containersListPath) as ContainersList;
    }

    // #endregion Cache control

    // #region Paths

    // #region Temporary data paths
    public get StorageAccountTempPath(): string {
        return path.join(tmpdir(), PACKAGE_JSON.name, this.config.storageAccount);
    }

    public get ContainersListPath(): string {
        return path.join(this.StorageAccountTempPath, "containers.json");
    }

    public GetContainerBlobsListPath(containerName: string): string {
        return path.join(this.StorageAccountTempPath, containerName, "blobs-list.json");
    }

    public GetContainerDownloadsListPath(containerName: string): string {
        return path.join(this.StorageAccountTempPath, containerName, "downloads-list.json");
    }
    // #endregion Temporary data paths

    // #region Data output paths
    public GetContainerDownloadsDestinationPath(containerName: string): string {
        return path.join(this.config.outDir, this.config.storageAccount, containerName);
    }

    public GetContainerBlobDownloadPath(containerName: string, blobName: string): string {
        return path.join(this.GetContainerDownloadsDestinationPath(containerName), blobName);
    }
    //#endregion Data output paths

    // #region Progress and logging
    private progressTick(tokens?: ProgressTokens): void {
        if (this.progress != null) {
            this.progress!.tick(tokens);
        }
    }

    private logAction(logLevel: string, message: string): void {
        this.logger.log(logLevel, message);

        if (this.progress != null) {
            this.progress.render({
                lastActionTitle: message,
                logLevel: logLevel
            });
        }
    }

    private outputDownloadsListNotification(downloadsListLength: number, containerName: string): void {
        if (downloadsListLength === 0) {
            this.logAction(LOG_LEVELS.INFO, `All "${containerName}" blobs from Azure storage account ` +
                `"${this.config.storageAccount}" are stored locally.`);
        } else {
            this.logAction(LOG_LEVELS.ALERT, `Found ${downloadsListLength} blobs missing in "${containerName}"`);
        }
    }
    // #endregion Progress and logging

    // #region Promise handlers
    private downloadBlobsHandler: PromiseHandler<BlobService.BlobResult, BlobDownloadDto, BlobContext | undefined> =
        async (blobResult, context) => {
            // context is defined in DownloadContainerBlobs
            const containerName = context!.ContainerName;

            const blobDestinationPath = this.GetContainerBlobDownloadPath(containerName, blobResult.name);

            await fs.ensureDir(path.dirname(blobDestinationPath));

            const writeStream = fs.createWriteStream(blobDestinationPath);

            try {
                this.logAction(LOG_LEVELS.INFO, `Downloading "${blobResult.name}" from "${containerName}".`);

                const downloadedBlob = await GetBlobToStream(this.blobService, containerName, blobResult.name, writeStream);

                const blobContentLength = Number(blobResult.contentLength);

                if (!isFinite(blobContentLength)) {
                    throw new Error(`Blob "${blobResult.name}" from "${containerName}" content length is not a finite number.`);
                }

                if (blobContentLength === downloadedBlob.LocalContentLength) {
                    this.logAction(LOG_LEVELS.INFO, `Container's "${containerName}" blob "${blobResult.name}" successfully downloaded.`);
                    writeStream.close();
                    return downloadedBlob;
                } else {
                    throw new Error(`Blob "${blobResult.name}" content length in Azure (${blobContentLength})` +
                        `and locally (${downloadedBlob.LocalContentLength}) are different.`);
                }
            } catch (error) {
                this.logAction(LOG_LEVELS.ERROR, `Failed to download "${blobResult.name}" from "${containerName}"`);
                writeStream.close();
                throw error;
            }
        }

    private blobsListFetchHandler: PromiseHandler<BlobService.ContainerResult, BlobService.BlobResult[]> = async containerResult => {
        const results = await this.FetchContainerBlobsList(containerResult.name);
        return results;
    }
    // #endregion Promise handlers
}
