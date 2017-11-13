import { BlobService, StorageHost } from "azure-storage";

export interface BlobsList {
    ContainerName: string;
    TimeStamp: number;
    Entries: BlobService.BlobResult[];
}

export interface ConfigData {
    storageAccount: string;
    storageAccessKey: string;
    storageHost?: StorageHost;
    verbose?: boolean;
    outDir?: string;
    retriesCount?: number;
}
