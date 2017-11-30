import * as fs from "fs-extra";
import * as path from "path";
import * as Table from "cli-table2";
import * as FileSize from "filesize";
import { EOL } from "os";
import { BlobService } from "azure-storage";

import { BasePackage, BlobResultGetter } from "./cli-contracts";
import { ConfigData } from "../api/managers/storage-account/storage-account-contracts";

// #region Package helpers
/**
 * Path from current file to a `package.json`.
 */
const PACKAGE_JSON_PATH = "../../package.json";

/**
 * Object of `package.json`.
 */
export const PACKAGE_JSON = fs.readJSONSync(path.join(__dirname, PACKAGE_JSON_PATH)) as BasePackage;

/**
 * Get version string from `package.json`.
 */
export function GetVersion(): string {
    return PACKAGE_JSON.version;
}
// #endregion Package helpers

// #region CLI input
export const DEFAULT_CLI_VALUES = {
    ConfigFileName: "backup.config.json",
    LogFileName: ".backup-log"
};

/**
 * Checks if a container name is a valid string.
 *
 * @param containerName Azure storage container name.
 * @returns Is supplied container is a valid string.
 */
export function IsContainerNameValid(containerName: any): containerName is string {
    return typeof containerName === "string" && containerName.length > 0;
}

// #endregion CLI input

/**
 * Reads a configuration file from defined path.
 *
 * @export
 * @param {string} configPath configuration file path.
 * @returns {ConfigData} Configuration object.
 */
export function ReadConfig(configPath: string): ConfigData {
    try {
        const configString = fs.readFileSync(configPath).toString();
        return JSON.parse(configString) as ConfigData;
    } catch (error) {
        throw new Error(`Failed to load config file from \"${configPath}\". ${EOL} ${error}`);
    }
}

/**
 * Resolves a config path from supplied CLI argument (if provided).
 *
 * @param configPath config path provided in CLI.
 */
export function ResolveConfigPath(configPath: string | boolean | undefined): string {
    return ResolvePath(configPath, DEFAULT_CLI_VALUES.ConfigFileName, "Wrong config path:");
}

/**
 * Resolves a log path from supplied configuration value.
 *
 * @param logPath Log path provided in config (optional).
 */
export function ResolveLogPath(logPath?: string | boolean | undefined): string {
    return ResolvePath(logPath, DEFAULT_CLI_VALUES.LogFileName, "Wrong log path:");
}

/**
 * Resolves config schema path.
 *
 * @returns config schema path.
 */
export function ResolveConfigSchemaPath(): string {
    return path.resolve(__dirname, "../", CONFIG_JSON_SCHEMA_FILE_NAME);
}

/**
 * Resolves configuration JSON $schema value.
 *
 * @returns $schema value.
 */
export function ResolveConfigSchemaValue(): string {
    return `file:///${ResolveConfigSchemaPath()}`;
}

/**
 * Default JSON configuration schema file name.
 */
export const CONFIG_JSON_SCHEMA_FILE_NAME = "schema.backup.config.json";

// #endregion Config helpers

// #region FS helpers
/**
 * Processes supplied path to a valid path.
 */
export function ResolvePath(suppliedPath: string | boolean | undefined, defaultFileName: string, errorMessage: string): string {
    if (!suppliedPath) {
        return path.join(process.cwd(), defaultFileName);
    }

    if (typeof suppliedPath !== "string") {
        throw new Error(`${errorMessage} "${suppliedPath}".`);
    }

    if (path.isAbsolute(suppliedPath)) {
        return suppliedPath;
    } else {
        return path.join(process.cwd(), suppliedPath);
    }
}

// #endregion FS helpers

// #region CLI tables helpers
export const BlobsListTableConfig: Table.TableConstructorOptions = {
    head: ["Container name", "Blobs count", "Total size"],
    colWidths: [30, 15, 40]
};

/**
 * Constructs statistics table row of cli-table2.
 *
 * @template TItemType Type of items in supplied array.
 * @param containerName Azure Storage account container name.
 * @param items Items that contain blob result.
 * @param showInBytes Defines if blobs / files size should be displayed in bytes (optional, default value - false).
 * @param blobResultGetter Function that gets BlobService.BlobResult from supplied item.
 */
export function ConstructStatisticsTableRow<TItemType>(
    containerName: string,
    items: TItemType[],
    showInBytes: boolean = false,
    blobResultGetter: BlobResultGetter<TItemType>
): Table.HorizontalTableRow {
    let totalSize = 0;

    for (const item of items) {
        const blobResult = blobResultGetter(item);
        const contentLength = Number(blobResult.contentLength);
        if (isFinite(contentLength)) {
            totalSize += contentLength;
        }
    }

    const fileSize = showInBytes ? `${totalSize} B` : FileSize(totalSize);
    return [containerName, items.length, fileSize];
}

/**
 * Default value of function that gets BlobService.BlobResult from supplied item.
 *
 * @param item BlobService.BlobResult item.
 */
export const DefaultBlobResultGetter: BlobResultGetter<BlobService.BlobResult> = (item: BlobService.BlobResult) => item;
// #endregion CLI tables helpers
