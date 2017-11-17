import * as fs from "fs-extra";
import * as path from "path";
import { EOL } from "os";
import { Logger } from "azure-storage";

import { BasePackage } from "./cli-contracts";
import { ConfigData } from "../api/managers/storage-account/storage-account-contracts";

const PACKAGE_JSON_PATH = "../../package.json";

export const PACKAGE_JSON = fs.readJSONSync(path.join(__dirname, PACKAGE_JSON_PATH)) as BasePackage;

export function GetVersion(): string {
    return PACKAGE_JSON.version;
}

export function ConstructLoggerToFile(logLevel: string = Logger.LogLevels.INFO, logPath?: string): Logger {
    const logDestinationPath = logPath || path.join(process.cwd(), ".extractor-log");
    fs.removeSync(logDestinationPath);

    return new Logger(Logger.LogLevels.DEBUG, (level, message) => {
        const logLine = ConstructLogLine(level, message);

        switch (level) {
            case Logger.LogLevels.NOTICE: {
                console.info(logLine);
            }
            case Logger.LogLevels.CRITICAL: {
                console.error(logLine);
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

export const DEFAULT_CLI_ARGUMENTS = {
    config: "./extractor.config.json"
};

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

export function IsContainerNameValid(containerName: any): containerName is string {
    return typeof containerName === "string" && containerName.length > 0;
}
