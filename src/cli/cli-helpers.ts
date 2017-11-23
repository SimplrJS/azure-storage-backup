import * as fs from "fs-extra";
import * as path from "path";
import * as Table from "cli-table2";
import * as FileSize from "filesize";
import { EOL } from "os";
import { Logger, BlobService } from "azure-storage";

import { BasePackage, BlobResultGetter } from "./cli-contracts";
import { ConfigData } from "../api/managers/storage-account/storage-account-contracts";

// #region Package helpers
const PACKAGE_JSON_PATH = "../../package.json";

export const PACKAGE_JSON = fs.readJSONSync(path.join(__dirname, PACKAGE_JSON_PATH)) as BasePackage;

export function GetVersion(): string {
    return PACKAGE_JSON.version;
}
// #endregion Package helpers

// #region Logging helpers
export function ConstructDefaultLogger(logPath?: string): Logger {
    const logDestinationPath = ResolveLogPath(logPath);
    fs.removeSync(logDestinationPath);

    return new Logger(Logger.LogLevels.DEBUG, (level, message) => {
        const logLine = ConstructLogLine(level, message);

        switch (level) {
            case Logger.LogLevels.NOTICE: {
                console.info(logLine);
                break;
            }
            case Logger.LogLevels.CRITICAL: {
                console.error(logLine);
                break;
            }
        }

        fs.appendFileSync(logDestinationPath, logLine + EOL);
    });
}

export function ConstructLogLine(level: string, message: string): string {
    const time = new Date();
    const localDate = time.toLocaleDateString();
    const localTime = time.toLocaleTimeString();

    return `[${localDate} ${localTime}]${level} : ${message}`;
}

// #endregion Logging helpers

// #region CLI input
export const DEFAULT_CLI_VALUES = {
    ConfigFileName: "extractor.config.json",
    LogFileName: ".extractor-log"
};

export function IsContainerNameValid(containerName: any): containerName is string {
    return typeof containerName === "string" && containerName.length > 0;
}
// #endregion CLI input

// #region Config helpers
export function ReadConfig(configPath: string): ConfigData {
    try {
        const configString = fs.readFileSync(configPath).toString();
        return JSON.parse(configString) as ConfigData;
    } catch (error) {
        throw new Error(`Failed to load config file from \"${configPath}\". ${EOL} ${error}`);
    }
}

export function ResolveConfigPath(configPath: string | boolean | undefined): string {
    return ResolvePath(configPath, DEFAULT_CLI_VALUES.ConfigFileName, "Wrong config path:");
}

export function ResolveLogPath(logPath?: string | boolean | undefined): string {
    return ResolvePath(logPath, DEFAULT_CLI_VALUES.LogFileName, "Wrong log path:");
}

export function ResolveConfigSchemaPath(): string {
    return path.resolve(__dirname, "../", CONFIG_JSON_SCHEMA_FILE_NAME);
}

export function ResolveConfigSchemaValue(): string {
    return `file:///${ResolveConfigSchemaPath()}`;
}

export const CONFIG_JSON_SCHEMA_FILE_NAME = "schema.extractor.config.json";

// #endregion Config helpers

// #region FS helpers

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

export const DefaultBlobResultGetter: BlobResultGetter<BlobService.BlobResult> = item => item;
// #endregion CLI tables helpers
