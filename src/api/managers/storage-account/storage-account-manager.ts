import * as fs from "fs-extra";
import * as path from "path";
import { tmpdir, EOL } from "os";
import { Logger, createBlobService, BlobService } from "azure-storage";

import { ConfigData, BlobsList, BlobContext } from "./storage-account-contracts";
import { ContainerManager } from "../container-manager";
import { BlobManager } from "../blob-manager";
import { AsyncManager, PromiseHandler, ResultDto } from "../../promises/async-manager";

import { PACKAGE_JSON } from "../../../cli/cli-helpers";
import { GetServiceProperties, GetLocalFilesList, FilterMissingBlobsList, GetBlobToStream } from "../../helpers/blob-helpers";
import { BlobDownloadDto } from "../../contracts/blob-helpers-contracts";

export class StorageAccountManager {
    constructor(private config: ConfigData, private logger: Logger, private noCache: boolean = false) {
        this.blobService = createBlobService(this.config.storageAccount, this.config.storageAccessKey, this.config.storageHost);
        this.containersManager = new ContainerManager(this.blobService);
    }

    private blobService: BlobService;
    private containersManager: ContainerManager;

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
        // TODO: cache "/Temp/{package-name}/{storage-account}/containers.json"
        try {
            this.logger.info(`Fetching all containers from storage account "${this.config.storageAccount}".`);
            const result = await this.containersManager.FetchAll();
            this.logger.notice(`Fetched ${this.containersManager.Entries.length} container objects` +
                ` from storage account "${this.config.storageAccount}".`);
            return result;
        } catch (error) {
            this.logger.alert(`Failed to fetch containers list of storage account "${this.config.storageAccount}". ${EOL} ${error}}`);
            throw error;
        }
    }

    public GetContainerBlobsListPath(containerName: string): string {
        return path.join(tmpdir(), PACKAGE_JSON.name, this.config.storageAccount, containerName, "blobs-list.json");
    }

    public GetContainerDownloadsListPath(containerName: string): string {
        return path.join(tmpdir(), PACKAGE_JSON.name, this.config.storageAccount, containerName, "downloads-list.json");
    }

    public GetContainerDownloadsDestinationPath(containerName: string): string {
        return path.join(this.config.outDir, this.config.storageAccount, containerName);
    }

    public GetContainerBlobDownloadPath(containerName: string, blobName: string): string {
        return path.join(this.GetContainerDownloadsDestinationPath(containerName), blobName);
    }

    public async GetContainerCachedBlobsList(containerName: string): Promise<BlobsList> {
        const blobsListPath = this.GetContainerBlobsListPath(containerName);
        try {
            return await fs.readJSON(blobsListPath) as BlobsList;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async FetchContainerBlobsList(containerName: string): Promise<BlobService.BlobResult[]> {
        let blobsList: BlobService.BlobResult[] | undefined;
        // Searching for container's blob list in cache
        if (!this.noCache) {
            try {
                this.logger.info("Searching for container's blob list in cache.");
                const cachedBlobsList = await this.GetContainerCachedBlobsList(containerName);
                this.logger.notice(`"${containerName}" container's blob list fetched from cache.`);
                blobsList = cachedBlobsList.Entries;
            } catch (error) {
                this.logger.error(`Failed to get cached blob list for container "${containerName}".`);
            }
        }

        // Getting container's list from Azure.
        if (blobsList == null) {
            const blobManager = new BlobManager(this.blobService, containerName);
            this.logger.info(`Fetching blobs list of "${containerName}" from Azure.`);
            try {
                blobsList = await blobManager.FetchAll();
                this.logger.notice(`"${containerName}" blobs list fetched successfully."`);
                await this.cacheBlobsList(containerName, blobsList);
            } catch (error) {
                this.logger.error(`Failed to fetch blobs list of ${containerName} from Azure.`);
                throw error;
            }
        }

        return blobsList;
    }

    public async FetchContainersBlobsList(): Promise<void> {
        try {
            this.logger.info(`Fetching blobs list from ${this.containersManager.Count} containers.`);
            const asyncManager = new AsyncManager<BlobService.ContainerResult, BlobService.BlobResult[]>(this.blobsListFetchHandler);
            await asyncManager.Start(this.containersManager.Entries);
            this.logger.notice(`Fetched blobs list from ${this.containersManager.Count} containers.`);
        } catch (error) {
            this.logger.alert(`Failed to fetch blobs list from ${this.containersManager.Count} containers.`);
        }
    }

    private async cacheBlobsList(containerName: string, entries: BlobService.BlobResult[]): Promise<void> {
        this.logger.info(`Caching ${entries.length} "${containerName}" blob list entries.`);
        const listPath = this.GetContainerBlobsListPath(containerName);
        const directory = path.parse(listPath).dir;

        await fs.mkdirp(directory);

        const blobsList: BlobsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(listPath, blobsList);
        this.logger.info(`${entries.length} "${containerName}" blob list entries. Successfully cached.`);
    }

    private async saveContainerDownloadsList(containerName: string, entries: BlobService.BlobResult[]): Promise<void> {
        this.logger.info(`Caching ${entries.length} "${containerName}" missing blobs list entries.`);
        const blobsListPath = this.GetContainerDownloadsListPath(containerName);

        const downloadsList: BlobsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(blobsListPath, downloadsList);
        this.logger.notice(`${entries.length} "${containerName}" missing blobs list entries. Successfully cached.`);
    }

    public async ValidateContainerFiles(containerName: string, clearCache: boolean = false): Promise<BlobService.BlobResult[]> {
        this.logger.info(`Validating "${containerName}" downloaded files with blobs list.`);

        const downloadsListPath = this.GetContainerDownloadsListPath(containerName);

        if (!this.noCache) {
            try {
                this.logger.info(`Getting cached "${containerName}" downloads list.`);
                const cachedDownloadsList = await fs.readJson(downloadsListPath) as BlobsList;
                if (cachedDownloadsList != null) {
                    this.logger.notice(`"${containerName}" cached downloads list found.`);

                    if (clearCache) {
                        await fs.remove(downloadsListPath);
                    }

                    return cachedDownloadsList.Entries;
                } else {
                    // If empty file found, remove it.
                    await fs.remove(downloadsListPath);
                    throw new Error("No content in cached file");
                }
            } catch (error) {
                this.logger.warn(`Failed to get cached "${containerName}" container downloads list.`);
            }
        }

        // Get cached blob-list by container
        const blobsList = await this.FetchContainerBlobsList(containerName);

        this.logger.info(`Getting "${containerName}" downloaded files list.`);
        const containerSourcePath = this.GetContainerDownloadsDestinationPath(containerName);
        const localFilesList = await GetLocalFilesList(containerSourcePath);
        this.logger.notice(`"${containerName}" downloaded files list successfully fetched.`);

        // Filtering missing blobs
        let downloadsList = new Array<BlobService.BlobResult>();
        if (localFilesList.length > 0) {
            downloadsList = await FilterMissingBlobsList(blobsList, localFilesList);
        } else {
            downloadsList = blobsList;
        }

        if (clearCache) {
            await fs.remove(downloadsListPath);
        } else {
            // Save checked list in temp folder. "/tmpdir/{package-name}/{azure-storage-account}/{container-name}/check-list.json"
            await this.saveContainerDownloadsList(containerName, downloadsList);
        }

        if (downloadsList.length === 0) {
            this.logger.notice(`All "${containerName}" blobs from Azure storage account ` +
                `"${this.config.storageAccount}" are stored locally.`);
        } else {
            this.logger.alert(`Found ${downloadsList.length} blobs missing in "${containerName}"`);
        }

        return downloadsList;
    }

    public async DownloadContainerBlobs(containerName: string): Promise<ResultDto<BlobService.BlobResult, BlobDownloadDto>> {
        const downloadsList = await this.ValidateContainerFiles(containerName, true);

        const asyncManager = new AsyncManager<BlobService.BlobResult, BlobDownloadDto, BlobContext>(this.downloadBlobsHandler, 5);
        return await asyncManager.Start(downloadsList, { ContainerName: containerName });
    }

    private async ensureBlobDestinationFolder(containerName: string, blobName: string): Promise<void> {
        const blobPath = this.GetContainerBlobDownloadPath(containerName, blobName);
        const parsedPath = path.parse(blobPath);
        return await fs.mkdirp(parsedPath.dir);
    }

    private downloadBlobsHandler: PromiseHandler<BlobService.BlobResult, BlobDownloadDto, BlobContext | undefined> =
        async (blobResult, context) => {
            // context is defined in DownloadContainerBlobs
            const containerName = context!.ContainerName;

            const blobDestinationPath = this.GetContainerBlobDownloadPath(context!.ContainerName, blobResult.name);
            const writeStream = fs.createWriteStream(blobDestinationPath);

            try {
                this.logger.info(`Downloading "${blobResult.name}" from "${containerName}".`);

                await this.ensureBlobDestinationFolder(containerName, blobResult.name);

                const downloadedBlob = await GetBlobToStream(this.blobService, containerName, blobResult.name, writeStream);

                const blobContentLength = Number(blobResult.contentLength);

                if (!isFinite(blobContentLength)) {
                    throw new Error(`Blob "${blobResult.name}" from "${containerName}" content length is not a finite number.`);
                }

                if (blobContentLength === downloadedBlob.LocalContentLength) {
                    this.logger.notice(`Container's "${containerName}" blob "${blobResult.name}" successfully downloaded.`);
                    writeStream.close();
                    return downloadedBlob;
                } else {
                    throw new Error(`Blob "${blobResult.name}" content length in Azure (${blobContentLength})` +
                        `and locally (${downloadedBlob.LocalContentLength}) are different.`);
                }

            } catch (error) {
                this.logger.error(`Failed to download "${blobResult.name}" from "${containerName}"${EOL}${error}`);
                writeStream.close();
                throw error;
            }
        }

    private blobsListFetchHandler: PromiseHandler<BlobService.ContainerResult, BlobService.BlobResult[]> = async containerResult => {
        const results = await this.FetchContainerBlobsList(containerResult.name);
        return results;
    }
}
