import * as fs from "fs-extra";
import * as path from "path";
import { tmpdir, EOL } from "os";
import { Logger, createBlobService, BlobService } from "azure-storage";

import { ConfigData, BlobsList, CheckList } from "./storage-account-contracts";
import { ContainerManager } from "../container-manager";
import { BlobManager } from "../blob-manager";
import { AsyncManager, PromiseHandler } from "../../promises/async-manager";

import { PACKAGE_JSON } from "../../../cli/cli-helpers";
import { GetServiceProperties, GetLocalFilesList, GetMissingBlobs } from "../../helpers/blob-helpers";

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

    public GetBlobListPath(containerName: string): string {
        return path.join(tmpdir(), PACKAGE_JSON.name, this.config.storageAccount, containerName, "blobs-list.json");
    }

    public GetCheckedListPath(containerName: string): string {
        return path.join(tmpdir(), PACKAGE_JSON.name, this.config.storageAccount, containerName, "check-list.json");
    }

    public async GetCachedBlobList(containerName: string): Promise<BlobsList> {
        const blobsListPath = this.GetBlobListPath(containerName);
        try {
            return await fs.readJSON(blobsListPath) as BlobsList;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async FetchContainerBlobsListByContainerName(containerName: string): Promise<BlobService.BlobResult[]> {
        let blobsList: BlobService.BlobResult[] | undefined;
        // Searching for container's blob list in cache
        if (!this.noCache) {
            try {
                this.logger.info("Searching for container's blob list in cache.");
                const blobsListDto = await this.GetCachedBlobList(containerName);
                this.logger.notice(`"${containerName}" container's blob list fetched from cache.`);
                blobsList = blobsListDto.Entries;
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
        const listPath = this.GetBlobListPath(containerName);
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

    private async cacheCheckedList(containerName: string, entries: string[]): Promise<void> {
        this.logger.info(`Caching ${entries.length} "${containerName}" checked list entries.`);
        const listPath = this.GetCheckedListPath(containerName);

        const checkList: CheckList = {
            ContainerName: containerName,
            TimeStamp: Date.now(),
            Entries: entries
        };

        await fs.writeJSON(listPath, checkList);
        this.logger.info(`${entries.length} "${containerName}" checked list entries. Successfully cached.`);
    }

    public async CheckedContainer(containerName: string): Promise<string[]> {
        if (!this.noCache) {
            const checkedListPath = this.GetCheckedListPath(containerName);
            try {
                const checkedList = await fs.readJson(checkedListPath) as CheckList;
                if (checkedList != null) {
                    return checkedList.Entries;
                }
            } catch (error) {
                this.logger.warn(`Failed to read JSON. ${EOL}${error}`);
            }
        }

        // Get cached blob-list by container
        const blobList = await this.FetchContainerBlobsListByContainerName(containerName);

        // Get downloaded file list by container. From: "./{azure-storage-account}/{container-name}/"
        const containerSourcePath = path.join(this.config.outDir, this.config.storageAccount, containerName);
        const localDownloadedList = await GetLocalFilesList(containerSourcePath);

        // Get missing blobs
        let missingBlob = new Array<string>();
        if (localDownloadedList.length > 0) {
            missingBlob = await GetMissingBlobs(blobList, localDownloadedList);
        } else {
            missingBlob = blobList.map(x => x.name);
        }

        // Save checked list in temp folder. "/tmpdir/{package-name}/{azure-storage-account}/{container-name}/check-list.json"
        await this.cacheCheckedList(containerName, missingBlob);
        return missingBlob;
    }

    private blobsListFetchHandler: PromiseHandler<BlobService.ContainerResult, BlobService.BlobResult[]> = async containerResult => {
        const results = await this.FetchContainerBlobsListByContainerName(containerResult.name, );
        return results;
    }
}
