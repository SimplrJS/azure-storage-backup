import { BlobService, StorageHost } from "azure-storage";

export interface CachedList<T> {
    ContainerName: string;
    TimeStamp: number;
    Entries: T[];
}

export type BlobsList = CachedList<BlobService.BlobResult>;

export type CheckList = CachedList<string>;

export interface ConfigData {
    storageAccount: string;
    storageAccessKey: string;
    storageHost?: StorageHost;
    verbose: boolean;
    outDir: string;
    retriesCount: number;
}
