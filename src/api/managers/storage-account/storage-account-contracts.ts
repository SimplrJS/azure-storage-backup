import { BlobService, StorageHost } from "azure-storage";

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
    verbose: boolean;
    outDir: string;
    retriesCount: number;
}

export interface BlobContext {
    ContainerName: string;
}

export interface ProgressTokens {
    LastActionTitle: string;
    LogLevel: string;
}
