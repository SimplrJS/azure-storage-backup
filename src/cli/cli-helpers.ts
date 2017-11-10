import * as fs from "fs-extra";
import * as path from "path";
import { EOL } from "os";
import { Logger } from "azure-storage";

import { BasePackage } from "../api/contracts/app-contracts";
import { ConfigData } from "../api/managers/storage-account/storage-account-contracts";

const PACKAGE_JSON_PATH = "../../package.json";

export function GetVersion(): string {
    const packageData = fs.readJsonSync(path.join(__dirname, PACKAGE_JSON_PATH)) as BasePackage;
    return packageData.version;
}

export const DEFAULT_LOGGER = new Logger(Logger.LogLevels.INFO);

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
