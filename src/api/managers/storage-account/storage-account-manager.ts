import * as fs from "fs-extra";
import * as path from "path";
import { tmpdir, EOL } from "os";
import { createBlobService, BlobService } from "azure-storage";
import { LoggerBuilder, LogLevel } from "simplr-logger";

import {
    ConfigData,
    BlobsList,
    BlobContext,
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
import { ProgressLoggingHandler } from "../../../cli/logger/progress-logging-handler";

export class StorageAccountManager {
    constructor(
        private config: ConfigData,
        private logger: LoggerBuilder,
        private noCache: boolean = false,
        private showProgress: boolean = true
    ) {
        this.blobService = createBlobService(this.config.storageAccount, this.config.storageAccessKey, this.config.storageHost);
        this.containersManager = new ContainerManager(this.blobService);
        this.progressLoggingHandler = new ProgressLoggingHandler();

        this.logger.UpdateConfiguration(
            configBuilder => configBuilder
                .AddWriteMessageHandler({ Handler: this.progressLoggingHandler }, this.progressLogLevels)
                .Build()
        );
    }

    // #region Private variables
    private blobService: BlobService;
    private containersManager: ContainerManager;

    private progressLoggingHandler: ProgressLoggingHandler;

    private readonly progressLogLevels: LogLevel[] = [
        LogLevel.Debug,
        LogLevel.Error,
        LogLevel.Warning
    ];
    // #endregion Private variables

    /**
     * Checks current Azure storage account service status.
     */
    public async CheckServiceStatus(): Promise<void> {
        try {
            this.logger.Info(`Checking service connectivity with storage account "${this.config.storageAccount}".`);
            await GetServiceProperties(this.blobService);
            this.logger.Info(`Successfully connected to storage account "${this.config.storageAccount}".`);
        } catch (error) {
            this.logger.Critical(`Failed to connect to storage account "${this.config.storageAccount}".`);
            throw error;
        }
    }

    /**
     * Retrieves containers list of current Azure storage account.
     */
    public async FetchAllContainers(): Promise<BlobService.ContainerResult[]> {
        if (!this.noCache) {
            try {
                this.logger.Debug(`Searching for ${this.config.storageAccount} containers list in cache.`);
                const cachedBlobsList = await this.GetCachedContainersList();
                this.logger.Info(`"${this.config.storageAccount}" containers list fetched from cache.`);
                return cachedBlobsList.Entries;
            } catch (error) {
                this.logger.Error(`Failed to get cached containers list for storage account "${this.config.storageAccount}".`);
            }
        }

        try {
            this.logger.Debug(`Fetching all containers from storage account "${this.config.storageAccount}".`);
            const containersList = await this.containersManager.FetchAll();
            this.logger.Info(`Fetched ${this.containersManager.Entries.length} container objects` +
                ` from storage account "${this.config.storageAccount}".`);

            this.logger.Debug(`Caching ${containersList.length} "${this.config.storageAccount}" containers list entries.`);
            await this.saveContainersList(containersList);
            this.logger.Info(`${containersList.length} ${this.config.storageAccount} containers entries cached.`);

            return containersList;
        } catch (error) {
            this.logger.Error(`Failed to fetch containers list of a storage account "${this.config.storageAccount}". ${EOL} ${error}}`);
            throw error;
        }
    }

    // #region BlobsLists

    /**
     * Retrieves blobs list in all containers of current Azure storage account.
     */
    public async FetchContainersBlobsList(): Promise<AsyncSessionResultDto<BlobService.ContainerResult, BlobService.BlobResult[]>> {
        try {
            const containersList = await this.FetchAllContainers();
            this.logger.Info(`Fetching blobs list from ${containersList.length} containers.`);
            const asyncManager = new AsyncManager<BlobService.ContainerResult, BlobService.BlobResult[]>(
                this.blobsListFetchHandler,
                undefined,
                this.config.maxRetriesCount
            );

            if (this.showProgress) {
                this.progressLoggingHandler.NewProgress(containersList.length);

                asyncManager.OnSinglePromiseFinished = () => {
                    this.progressLoggingHandler.Tick();
                };
            }

            this.progressLoggingHandler.ClearProgress();
            const result = await asyncManager.Start(containersList);
            this.logger.Info(`Fetched blobs list from ${containersList.length} containers.`);
            return result;
        } catch (error) {
            this.logger.Error(`Failed to fetch blobs list from ${this.config.storageAccount} containers.`);
            return { Failed: [], Succeeded: [] };
        }
    }

    /**
     * Retrieves blobs list of a container.
     *
     * @param {string} containerName Container in your current Azure storage account.
     */
    public async FetchContainerBlobsList(containerName: string): Promise<BlobService.BlobResult[]> {
        let blobsList: BlobService.BlobResult[] | undefined;
        // Searching for container's blob list in cache
        if (!this.noCache) {
            try {
                this.logger.Debug("Searching for container's blob list in cache.");
                const cachedBlobsList = await this.GetContainerCachedBlobsList(containerName);
                this.logger.Debug(`"${containerName}" container's blob list fetched from cache.`);
                blobsList = cachedBlobsList.Entries;
            } catch (error) {
                this.logger.Error(`Failed to get cached blob list for container "${containerName}".`);
            }
        }

        // Getting container's list from Azure.
        if (blobsList == null) {
            const blobManager = new BlobManager(this.blobService, containerName);
            this.logger.Debug(`Fetching blobs list of "${containerName}" from Azure.`);
            try {
                blobsList = await blobManager.FetchAll();
                this.logger.Debug(`"${containerName}" blobs list fetched successfully."`);
                await this.saveBlobsList(containerName, blobsList);
            } catch (error) {
                this.logger.Error(`Failed to fetch blobs list of ${containerName} from Azure.`);
                throw error;
            }
        }

        return blobsList;
    }
    // #endregion Blobs Lists

    // #region Files validation

    /**
     * Retrieves missing Azure storage account container files in local system.
     */
    public async ValidateContainerFiles(containerName: string, clearCache: boolean = false): Promise<BlobService.BlobResult[]> {
        this.logger.Debug(`Validating "${containerName}" downloaded files with blobs list.`);

        const downloadsListPath = this.GetContainerDownloadsListPath(containerName);

        if (!this.noCache) {
            try {
                this.logger.Debug(`Getting cached "${containerName}" downloads list.`);
                const cachedDownloadsList = await fs.readJson(downloadsListPath) as BlobsList;
                if (cachedDownloadsList != null) {
                    this.logger.Debug(`"${containerName}" cached downloads list found.`);

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
                this.logger.Warn(`Failed to get cached "${containerName}" container downloads list.`);
            }
        }

        // Get cached blob-list by container
        const blobsList = await this.FetchContainerBlobsList(containerName);

        this.logger.Debug(`Getting "${containerName}" downloaded files list.`);
        const containerSourcePath = this.GetContainerDownloadsDestinationPath(containerName);
        const localFilesList = await GetLocalFilesList(containerSourcePath);
        this.logger.Debug(`"${containerName}" downloaded files list successfully fetched.`);

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

    /**
     * Retrieves list of all missing Azure storage account files in local system.
     */
    public async ValidateContainersFiles(): Promise<Array<ContainerItemsList<BlobService.BlobResult>>> {
        // Get blob container list, and check one by one.
        const containers = await this.FetchAllContainers();

        if (this.showProgress) {
            this.progressLoggingHandler.NewProgress(containers.length);
        }

        const results: Array<ContainerItemsList<BlobService.BlobResult>> = [];

        for (const container of containers) {
            const downloadsList = await this.ValidateContainerFiles(container.name);
            results.push({
                ContainerName: container.name,
                Entries: downloadsList
            });
            this.progressLoggingHandler.Tick();
        }

        this.progressLoggingHandler.ClearProgress();

        return results;
    }
    // #endregion Files validation

    // #region Blobs download
    /**
     * Downloads container blobs that are missing in file system.
     */
    public async DownloadContainerBlobs(containerName: string): Promise<ContainerDownloadedBlobsResult | undefined> {
        const downloadsList = await this.ValidateContainerFiles(containerName, true);

        if (downloadsList.length === 0) {
            // All blobs downloaded
            return undefined;
        }

        const asyncManager = new AsyncManager<BlobService.BlobResult, BlobDownloadDto, BlobContext>(
            this.downloadBlobsHandler,
            this.config.simultaneousDownloadsCount,
            this.config.maxRetriesCount
        );

        if (this.showProgress) {
            this.progressLoggingHandler.NewProgress(downloadsList.length);

            asyncManager.OnSinglePromiseFinished = () => {
                this.progressLoggingHandler.Tick();
            };
        }

        const results = await asyncManager.Start(downloadsList, { ContainerName: containerName });

        this.logger.Info(
            `"${containerName}" results: ${results.Succeeded.length} - downloads succeeded`,
            ` ${results.Failed.length} - downloads failed.`
        );

        this.progressLoggingHandler.ClearProgress();

        return results;
    }

    /**
     * Downloads all missing blobs that are missing in file system.
     */
    public async DownloadContainersBlobs(): Promise<ContainersDownloadedBlobsResult> {
        // Get blob container list, and check one by one.
        const containers = await this.FetchAllContainers();

        const results: ContainersDownloadedBlobsResult = [];

        for (let i = 0; i < containers.length; i++) {
            const containerName = containers[i].name;

            this.logger.Info(`Downloading "${containerName}" blobs (${this.config.simultaneousDownloadsCount} concurrently). ` +
                `${i} / ${containers.length} containers finished.`);
            const containerDownloadResults = await this.DownloadContainerBlobs(containerName);

            if (containerDownloadResults != null) {
                results.push(containerDownloadResults);
            } else {
                this.logger.Info(`All container "${containerName}" blobs already downloaded. ` +
                    `${i + 1} / ${containers.length} containers finished.`);
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
        this.logger.Debug(`Caching ${entries.length} "${containerName}" blob list entries.`);
        const listPath = this.GetContainerBlobsListPath(containerName);
        const directory = path.parse(listPath).dir;

        await fs.ensureDir(directory);

        const blobsList: BlobsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(listPath, blobsList);
        this.logger.Debug(`${entries.length} "${containerName}" blob list entries. Successfully cached.`);
    }

    private async saveContainerDownloadsList(containerName: string, entries: BlobService.BlobResult[]): Promise<void> {
        this.logger.Debug(`Caching ${entries.length} "${containerName}" missing blobs list entries.`);
        const blobsListPath = this.GetContainerDownloadsListPath(containerName);

        const downloadsList: BlobsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(blobsListPath, downloadsList);
        this.logger.Debug(`${entries.length} "${containerName}" missing blobs list entries. Successfully cached.`);
    }

    /**
     * Get containers blobs lists from cache.
     */
    public async GetContainerCachedBlobsList(containerName: string): Promise<BlobsList> {
        const blobsListPath = this.GetContainerBlobsListPath(containerName);
        return await fs.readJSON(blobsListPath) as BlobsList;
    }

    /**
     * Gets containers list from cache.
     */
    public async GetCachedContainersList(): Promise<ContainersList> {
        const containersListPath = this.ContainersListPath;
        return await fs.readJSON(containersListPath) as ContainersList;
    }

    // #endregion Cache control

    // #region Paths

    // #region Temporary data paths

    /**
     * Generates directory path of Storage account temporary data.
     */
    public get StorageAccountTempPath(): string {
        return path.join(tmpdir(), PACKAGE_JSON.name, this.config.storageAccount);
    }

    /**
     * Generates containers list temporary JSON path.
     */
    public get ContainersListPath(): string {
        return path.join(this.StorageAccountTempPath, "containers.json");
    }

    /**
     * Generates container blobs list temporary JSON path.
     */
    public GetContainerBlobsListPath(containerName: string): string {
        return path.join(this.StorageAccountTempPath, containerName, "blobs-list.json");
    }

    /**
     * Generates container downloads list temporary JSON path.
     */
    public GetContainerDownloadsListPath(containerName: string): string {
        return path.join(this.StorageAccountTempPath, containerName, "downloads-list.json");
    }
    // #endregion Temporary data paths

    // #region Data output paths

    /**
     * Retrieves container downloads destination path.
     */
    public GetContainerDownloadsDestinationPath(containerName: string): string {
        return path.join(this.config.outDir, this.config.storageAccount, containerName);
    }

    /**
     * Retrieves downloaded blob destination path.
     */
    public GetContainerBlobDownloadPath(containerName: string, blobName: string): string {
        return path.join(this.GetContainerDownloadsDestinationPath(containerName), blobName);
    }
    //#endregion Data output paths

    // #region Logging
    private outputDownloadsListNotification(downloadsListLength: number, containerName: string): void {
        if (downloadsListLength === 0) {
            this.logger.Debug(`All "${containerName}" blobs from Azure storage account ` +
                `"${this.config.storageAccount}" are stored locally.`);
        } else {
            this.logger.Warn(`Found ${downloadsListLength} blobs missing in "${containerName}"`);
        }
    }
    // #endregion Logging

    // #region Promise handlers
    private downloadBlobsHandler: PromiseHandler<BlobService.BlobResult, BlobDownloadDto, BlobContext | undefined> =
        async (blobResult, context) => {
            // context is defined in DownloadContainerBlobs
            const containerName = context!.ContainerName;

            const blobDestinationPath = this.GetContainerBlobDownloadPath(containerName, blobResult.name);

            await fs.ensureDir(path.dirname(blobDestinationPath));

            const writeStream = fs.createWriteStream(blobDestinationPath);

            try {
                this.logger.Debug(`Downloading "${blobResult.name}" from "${containerName}".`);

                const downloadedBlob = await GetBlobToStream(this.blobService, containerName, blobResult.name, writeStream);

                const blobContentLength = Number(blobResult.contentLength);

                if (!isFinite(blobContentLength)) {
                    throw new Error(`Blob "${blobResult.name}" from "${containerName}" content length is not a finite number.`);
                }

                if (blobContentLength === downloadedBlob.LocalContentLength) {
                    this.logger.Debug(`Container's "${containerName}" blob "${blobResult.name}" successfully downloaded.`);
                    writeStream.close();
                    return downloadedBlob;
                } else {
                    throw new Error(`Blob "${blobResult.name}" content length in Azure (${blobContentLength})` +
                        `and locally (${downloadedBlob.LocalContentLength}) are different.`);
                }
            } catch (error) {
                this.logger.Error(`Failed to download "${blobResult.name}" from "${containerName}"`);
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
