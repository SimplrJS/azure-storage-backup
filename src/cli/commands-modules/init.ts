import * as path from "path";
import { prompt, Questions } from "inquirer";
import { CommandModule } from "yargs";
import { writeJSON, readJSON } from "fs-extra";
import { CLIArgumentsObject } from "../cli-contracts";
import { ConfigData } from "../../api/managers/storage-account/storage-account-contracts";
import { DEFAULT_CLI_VALUES, ResolveConfigPath, ResolveLogPath, ResolveConfigSchemaValue } from "../cli-helpers";
import { CLILogger, AddFileMessageHandler } from "../logger/cli-logger";

export enum ConnectionType {
    AccountNameAndKey = "accountNameAndKey",
    ConnectionString = "connectionString"
}

export interface AzureStorageAnswersDto extends ConfigData {
    configPath: string;
}

/**
 * CLI command `init` class.
 *
 * Generates a configuration file.
 */
class ConfigInitializationCommandClass implements CommandModule {
    public command: string = "init";

    public describe: string = "Generates a configuration file.";

    private requireNotEmpty = (value: string): boolean | string => {
        if (value.trim().length !== 0) {
            return true;
        }
        return "Value is empty.";
    }

    private requirePositiveInteger = (value: string): boolean | string => {
        const valueIsNumber = Number(value);
        if (Number.isInteger(valueIsNumber) && valueIsNumber > 0) {
            return true;
        }
        return "Value is not a positive integer.";
    }

    private get defaultConfigValues(): ConfigData {
        return {
            storageAccount: "",
            storageAccessKey: "",
            storageHost: undefined,
            outDir: process.cwd(),
            maxRetriesCount: 3,
            simultaneousDownloadsCount: 10,
            logPath: ResolveLogPath(),
            noLogFile: false
        };
    }

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        const currentConfigPath = ResolveConfigPath(options.config);

        let initialConfig: ConfigData;
        try {
            CLILogger.Info(`Reading config from "${currentConfigPath}".`);
            initialConfig = await readJSON(currentConfigPath);
        } catch (error) {
            initialConfig = this.defaultConfigValues;
        }

        AddFileMessageHandler(initialConfig.logPath);

        const azureStorageQuestions: Questions = [
            {
                type: "input",
                name: "storageAccount",
                message: "Storage Account name:",
                default: initialConfig.storageAccount || undefined,
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "storageAccessKey",
                message: "Storage Account key:",
                default: initialConfig.storageAccessKey || undefined,
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "storageHost",
                message: "Storage host address (optional):",
                default: initialConfig.storageHost
            },
            {
                type: "input",
                name: "outDir",
                message: "Save downloaded files to directory:",
                default: initialConfig.outDir,
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "maxRetriesCount",
                message: "Max retries count for failed operations:",
                default: initialConfig.maxRetriesCount,
                validate: this.requirePositiveInteger
            },
            {
                type: "input",
                name: "configPath",
                message: "Save config file to directory:",
                default: process.cwd(),
                validate: this.requireNotEmpty
            }
        ];

        const azureStorageAnswers = await prompt(azureStorageQuestions);
        const { configPath, ...updatedConfigValues } = azureStorageAnswers as AzureStorageAnswersDto;

        updatedConfigValues.storageHost = azureStorageAnswers.storageHost || undefined;

        // Merging new values with existing
        const config = {
            ...initialConfig,
            ...updatedConfigValues,
            $schema: ResolveConfigSchemaValue()
        };

        const newConfigOutputPath = path.join(configPath, DEFAULT_CLI_VALUES.ConfigFileName);

        try {
            await writeJSON(newConfigOutputPath, config, { spaces: 4 });
            CLILogger.Info(`Successfully saved config to: "${newConfigOutputPath}"`);
        } catch (error) {
            CLILogger.Critical(error);
        }
    }
}

export const ConfigInitializationCommand = new ConfigInitializationCommandClass;
