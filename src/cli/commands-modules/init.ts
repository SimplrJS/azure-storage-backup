import * as path from "path";
import { prompt, Questions } from "inquirer";
import { CommandModule } from "yargs";
import { writeJSON, readJSON } from "fs-extra";
import { CLIArgumentsObject } from "../cli-contracts";
import { ConfigData } from "../../api/managers/storage-account/storage-account-contracts";
import { DEFAULT_CLI_ARGUMENTS, DefaultLogger } from "../cli-helpers";

export enum ConnectionType {
    AccountNameAndKey = "accountNameAndKey",
    ConnectionString = "connectionString"
}

export interface AzureStorageAnswersDto extends ConfigData {
    configPath: string;
}

class ConfigInitializationCommandClass implements CommandModule {
    public command: string = "init";

    public describe: string = "Run configuration prompts.";

    private requireNotEmpty = (value: string) => {
        if (value.trim().length !== 0) {
            return true;
        }
        return "Value is empty.";
    }

    private requirePositiveInteger = (value: string) => {
        const valueIsNumber = Number(value);
        if (Number.isInteger(valueIsNumber) && valueIsNumber > 0) {
            return true;
        }
        return "Value is not a positive integer.";
    }

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        const cwdConfigPath = path.join(process.cwd(), DEFAULT_CLI_ARGUMENTS.config);
        let initialConfig: ConfigData;
        try {
            initialConfig = await readJSON(cwdConfigPath) as ConfigData;
        } catch (error) {
            initialConfig = {
                storageAccount: "",
                storageAccessKey: "",
                storageHost: undefined,
                verbose: false,
                outDir: process.cwd(),
                retriesCount: 5
            };
        }

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
                type: "confirm",
                name: "verbose",
                message: "Verbose:",
                default: initialConfig.verbose
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
                name: "retriesCount",
                message: "Retries count:",
                default: initialConfig.retriesCount,
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
        const { configPath, ...config } = azureStorageAnswers as AzureStorageAnswersDto;
        config.storageHost = azureStorageAnswers.storageHost || undefined;

        const outputPath = path.join(configPath, DEFAULT_CLI_ARGUMENTS.config);

        try {
            await writeJSON(outputPath, config);
            DefaultLogger.log("Successfully saved config to:", outputPath);
        } catch (error) {
            DefaultLogger.error(error);
        }
    }
}

export const ConfigInitializationCommand = new ConfigInitializationCommandClass;
