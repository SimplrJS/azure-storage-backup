import { StorageHost } from "azure-storage";
import { BlobManager } from "../api/managers/blob-manager";

export type CommandHandler<T = any> = (args: T) => void;

export interface BasePackage {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    license?: string;
}

export interface CLIArgumentsObject {
    config?: string | boolean;
    stats?: boolean;
    sync?: boolean;
    check?: boolean;
    logDir?: string;
    retryFailed?: boolean;
}

export interface ConfigData {
    storageAccount: string;
    storageAccessKey: string;
    storageHost?: StorageHost;
    verbose?: boolean;
    outDir?: string;
    retriesCount?: number;
}

export interface BasePackage {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    license?: string;
}

export interface ContainersBlobs {
    [key: string]: BlobManager;
}
