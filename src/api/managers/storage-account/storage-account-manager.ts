import * as fs from "fs-extra";
import * as path from "path";
import { tmpdir, EOL } from "os";
import { Logger, createBlobService, BlobService } from "azure-storage";

import { ConfigData, BlobsList, DownloadsList } from "./storage-account-contracts";
import { ContainerManager } from "../container-manager";
import { BlobManager } from "../blob-manager";
import { AsyncManager, PromiseHandler } from "../../promises/async-manager";

import { PACKAGE_JSON } from "../../../cli/cli-helpers";
import { GetServiceProperties, GetLocalFilesList, FilterMissingBlobsList } from "../../helpers/blob-helpers";

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
            this.logger.notice(`Fetched ${this.containersManager.Entries.length} from storage account "${this.config.storageAccount}".`);
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
                // TODO: print error
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

    private async saveContainerDownloadsList(containerName: string, entries: string[]): Promise<void> {
        this.logger.info(`Caching ${entries.length} "${containerName}" missing blobs list entries.`);
        const blobsListPath = this.GetContainerDownloadsListPath(containerName);

        const checkList: DownloadsList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(blobsListPath, checkList);
        this.logger.notice(`${entries.length} "${containerName}" missing blobs list entries. Successfully cached.`);
    }

    public async ValidateContainerFiles(containerName: string): Promise<string[]> {
        if (!this.noCache) {
            const downloadsListPath = this.GetContainerDownloadsListPath(containerName);
            try {
                const cachedDownloadsList = await fs.readJson(downloadsListPath) as DownloadsList;
                if (cachedDownloadsList != null) {
                    return cachedDownloadsList.Entries;
                }
            } catch (error) {
                this.logger.warn(`Failed to get cached container downloads list ${EOL}${error}`);
            }
        }

        // Get cached blob-list by container
        const blobsList = await this.FetchContainerBlobsList(containerName);

        // Get downloaded file list by container. From: "./{azure-storage-account}/{container-name}/"
        const containerSourcePath = path.join(this.config.outDir, this.config.storageAccount, containerName);
        const localFilesList = await GetLocalFilesList(containerSourcePath);

        // Get missing blobs
        let downloadsList = new Array<string>();
        if (localFilesList.length > 0) {
            downloadsList = await FilterMissingBlobsList(blobsList, localFilesList);
        } else {
            downloadsList = blobsList.map(x => x.name);
        }

        // Save checked list in temp folder. "/tmpdir/{package-name}/{azure-storage-account}/{container-name}/check-list.json"
        await this.saveContainerDownloadsList(containerName, downloadsList);
        return downloadsList;
    }

    private blobsListFetchHandler: PromiseHandler<BlobService.ContainerResult, BlobService.BlobResult[]> = async containerResult => {
        const results = await this.FetchContainerBlobsList(containerResult.name, );
        return results;
    }
}
