import { BlobService } from "azure-storage";
import { LoggerBuilder } from "simplr-logger";
import { ConfigData, BlobsList, ContainerItemsList, ContainersList, ContainersDownloadedBlobsResult, ContainerDownloadedBlobsResult } from "./storage-account-contracts";
import { AsyncSessionResultDto } from "../../promises/async-manager";
export declare class StorageAccountManager {
    private config;
    private logger;
    private noCache;
    private showProgress;
    constructor(config: ConfigData, logger: LoggerBuilder, noCache?: boolean, showProgress?: boolean);
    private blobService;
    private containersManager;
    private progressLoggingHandler;
    private readonly progressLogLevels;
    /**
     * Checks current Azure storage account service status.
     */
    CheckServiceStatus(): Promise<void>;
    /**
     * Retrieves containers list of current Azure storage account.
     */
    FetchAllContainers(): Promise<BlobService.ContainerResult[]>;
    /**
     * Retrieves blobs list in all containers of current Azure storage account.
     */
    FetchContainersBlobsList(): Promise<AsyncSessionResultDto<BlobService.ContainerResult, BlobService.BlobResult[]>>;
    /**
     * Retrieves blobs list of a container.
     *
     * @param {string} containerName Container in your current Azure storage account.
     */
    FetchContainerBlobsList(containerName: string): Promise<BlobService.BlobResult[]>;
    /**
     * Retrieves missing Azure storage account container files in local system.
     */
    ValidateContainerFiles(containerName: string, clearCache?: boolean): Promise<BlobService.BlobResult[]>;
    /**
     * Retrieves list of all missing Azure storage account files in local system.
     */
    ValidateContainersFiles(): Promise<Array<ContainerItemsList<BlobService.BlobResult>>>;
    /**
     * Downloads container blobs that are missing in file system.
     */
    DownloadContainerBlobs(containerName: string): Promise<ContainerDownloadedBlobsResult | undefined>;
    /**
     * Downloads all missing blobs that are missing in file system.
     */
    DownloadContainersBlobs(): Promise<ContainersDownloadedBlobsResult>;
    private saveContainersList(entries);
    private saveBlobsList(containerName, entries);
    private saveContainerDownloadsList(containerName, entries);
    /**
     * Get containers blobs lists from cache.
     */
    GetContainerCachedBlobsList(containerName: string): Promise<BlobsList>;
    /**
     * Gets containers list from cache.
     */
    GetCachedContainersList(): Promise<ContainersList>;
    /**
     * Generates directory path of Storage account temporary data.
     */
    readonly StorageAccountTempPath: string;
    /**
     * Generates containers list temporary JSON path.
     */
    readonly ContainersListPath: string;
    /**
     * Generates container blobs list temporary JSON path.
     */
    GetContainerBlobsListPath(containerName: string): string;
    /**
     * Generates container downloads list temporary JSON path.
     */
    GetContainerDownloadsListPath(containerName: string): string;
    /**
     * Retrieves container downloads destination path.
     */
    GetContainerDownloadsDestinationPath(containerName: string): string;
    /**
     * Retrieves downloaded blob destination path.
     */
    GetContainerBlobDownloadPath(containerName: string, blobName: string): string;
    private outputDownloadsListNotification(downloadsListLength, containerName);
    private downloadBlobsHandler;
    private blobsListFetchHandler;
}
