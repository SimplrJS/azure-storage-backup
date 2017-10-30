import { StorageHost } from "azure-storage";

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
}

export interface ConfigData {
    StorageAccount: string;
    StorageAccessKey: string;
    StorageHost?: StorageHost;
}
