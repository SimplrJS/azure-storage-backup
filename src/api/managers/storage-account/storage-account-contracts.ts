import { BlobService, StorageHost } from "azure-storage";

export interface CachedList<T> {
    ContainerName: string;
    TimeStamp: number;
    Entries: T[];
}

export type BlobsList = CachedList<BlobService.BlobResult>;

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
