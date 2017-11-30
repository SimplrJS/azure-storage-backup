import * as Table from "cli-table2";
import { BlobService } from "azure-storage";
import { BasePackage, BlobResultGetter } from "./cli-contracts";
import { ConfigData } from "../api/managers/storage-account/storage-account-contracts";
/**
 * Object of `package.json`.
 */
export declare const PACKAGE_JSON: BasePackage;
/**
 * Get version string from `package.json`.
 */
export declare function GetVersion(): string;
export declare const DEFAULT_CLI_VALUES: {
    ConfigFileName: string;
    LogFileName: string;
};
/**
 * Checks if a container name is a valid string.
 *
 * @param containerName Azure storage container name.
 * @returns Is supplied container is a valid string.
 */
export declare function IsContainerNameValid(containerName: any): containerName is string;
/**
 * Reads a configuration file from defined path.
 *
 * @export
 * @param {string} configPath configuration file path.
 * @returns {ConfigData} Configuration object.
 */
export declare function ReadConfig(configPath: string): ConfigData;
/**
 * Resolves a config path from supplied CLI argument (if provided).
 *
 * @param configPath config path provided in CLI.
 */
export declare function ResolveConfigPath(configPath: string | boolean | undefined): string;
/**
 * Resolves a log path from supplied configuration value.
 *
 * @param logPath Log path provided in config (optional).
 */
export declare function ResolveLogPath(logPath?: string | boolean | undefined): string;
/**
 * Resolves config schema path.
 *
 * @returns config schema path.
 */
export declare function ResolveConfigSchemaPath(): string;
/**
 * Resolves configuration JSON $schema value.
 *
 * @returns $schema value.
 */
export declare function ResolveConfigSchemaValue(): string;
/**
 * Default JSON configuration schema file name.
 */
export declare const CONFIG_JSON_SCHEMA_FILE_NAME = "schema.backup.config.json";
/**
 * Processes supplied path to a valid path.
 */
export declare function ResolvePath(suppliedPath: string | boolean | undefined, defaultFileName: string, errorMessage: string): string;
export declare const BlobsListTableConfig: Table.TableConstructorOptions;
/**
 * Constructs statistics table row of cli-table2.
 *
 * @template TItemType Type of items in supplied array.
 * @param containerName Azure Storage account container name.
 * @param items Items that contain blob result.
 * @param showInBytes Defines if blobs / files size should be displayed in bytes (optional, default value - false).
 * @param blobResultGetter Function that gets BlobService.BlobResult from supplied item.
 */
export declare function ConstructStatisticsTableRow<TItemType>(containerName: string, items: TItemType[], showInBytes: boolean | undefined, blobResultGetter: BlobResultGetter<TItemType>): Table.HorizontalTableRow;
/**
 * Default value of function that gets BlobService.BlobResult from supplied item.
 *
 * @param item BlobService.BlobResult item.
 */
export declare const DefaultBlobResultGetter: BlobResultGetter<BlobService.BlobResult>;
