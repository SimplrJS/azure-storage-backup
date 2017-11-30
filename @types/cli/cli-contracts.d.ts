/// <reference types="node" />
import * as fs from "fs";
import { BlobService } from "azure-storage";
import { Arguments } from "yargs";
/**
 * Base properties of `package.json`.
 */
export interface BasePackage {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    license?: string;
}
/**
 * Argument of CLI.
 */
export interface CLIArgumentsObject extends Arguments {
    config?: string | boolean;
    container?: string | boolean;
    noCache?: boolean;
}
/**
 * Interface of a local file.
 */
export interface LocalFileDto extends fs.Stats {
    path: string;
}
/**
 * Type of a function that extracts a Blob result from an Item of ITemType.
 */
export declare type BlobResultGetter<TItemType> = (item: TItemType) => BlobService.BlobResult;
