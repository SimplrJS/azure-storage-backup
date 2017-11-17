import * as fs from "fs-extra";
import * as path from "path";
import * as Table from "cli-table2";
import * as FileSize from "filesize";
import { EOL } from "os";
import { Logger, BlobService } from "azure-storage";

import { BasePackage } from "./cli-contracts";
import { ConfigData } from "../api/managers/storage-account/storage-account-contracts";

// #region Package helpers
const PACKAGE_JSON_PATH = "../../package.json";

export const PACKAGE_JSON = fs.readJSONSync(path.join(__dirname, PACKAGE_JSON_PATH)) as BasePackage;

export function GetVersion(): string {
    return PACKAGE_JSON.version;
}
// #endregion Package helpers

// #region Logging helpers
export function ConstructLoggerToFile(logLevel: string = Logger.LogLevels.INFO, logPath?: string): Logger {
    const logDestinationPath = logPath || path.join(process.cwd(), ".extractor-log");
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

export const DefaultLogger = ConstructLoggerToFile();

// #endregion Logging helpers

// #region CLI input
export const DEFAULT_CLI_ARGUMENTS = {
    config: "./extractor.config.json"
};

export function IsContainerNameValid(containerName: any): containerName is string {
    return typeof containerName === "string" && containerName.length > 0;
}
// #endregion CLI input

// #region Config helpers
export function ReadConfig(configPath: string, logger: Logger): ConfigData {
    try {
        logger.info(`Reading config from "${configPath}".`);
        const configString = fs.readFileSync(configPath).toString();
        return JSON.parse(configString) as ConfigData;
    } catch (error) {
        logger.emergency(`Failed to load config file from \"${configPath}\". ${EOL} ${error}`);
        throw error;
    }
}

export function ResolveConfigPath(suppliedParameter: string | boolean | undefined): string {
    const configPath = typeof suppliedParameter === "string" ? suppliedParameter : DEFAULT_CLI_ARGUMENTS.config;
    return path.join(process.cwd(), configPath);
}
// #endregion Config helpers

// #region CLI tables helpers
export const BlobsListTableConfig: Table.TableConstructorOptions = {
    head: ["Container name", "Blobs count", "Total size"],
    colWidths: [30, 15, 40]
};

export function ConstructStatisticsTableRow(
    containerName: string,
    blobsResults: BlobService.BlobResult[],
    showInBytes: boolean = false
): Table.HorizontalTableRow {
    let totalSize = 0;

    for (const blobResult of blobsResults) {
        const contentLength = Number(blobResult.contentLength);
        if (isFinite(contentLength)) {
            totalSize += contentLength;
        }
    }

    const fileSize = showInBytes ? `${totalSize} B` : FileSize(totalSize);
    return [containerName, blobsResults.length, fileSize];
}
// #endregion CLI tables helpers
