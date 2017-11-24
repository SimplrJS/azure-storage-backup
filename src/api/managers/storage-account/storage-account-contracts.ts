import { BlobService, StorageHost } from "azure-storage";
import { BlobDownloadDto } from "../../contracts/blob-helpers-contracts";
import { AsyncSessionResultDto } from "../../promises/async-manager";

export interface ItemsList<T> {
    Entries: T[];
}

export interface ContainerItemsList<T> extends ItemsList<T> {
    ContainerName: string;
}

export interface CacheData {
    TimeStamp: number;
}

export type CachedContainerItemsList<T> = ContainerItemsList<T> & CacheData;

export type BlobsList = CachedContainerItemsList<BlobService.BlobResult>;

export interface StorageAccountItemsList<T> extends ItemsList<T> {
    StorageAccount: string;
}

export type ContainersList = StorageAccountItemsList<BlobService.ContainerResult> & CacheData;

export interface ConfigData {
    storageAccount: string;
    storageAccessKey: string;
    storageHost?: StorageHost;
    outDir: string;
    logPath: string;
    maxRetriesCount: number;
    simultaneousDownloadsCount: number;
    noLogFile?: boolean;
    $schema?: string;
}

export interface BlobContext {
    ContainerName: string;
}

export type ContainerDownloadedBlobsResult = AsyncSessionResultDto<BlobService.BlobResult, BlobDownloadDto, BlobContext | undefined>;
export type ContainersDownloadedBlobsResult = ContainerDownloadedBlobsResult[];
