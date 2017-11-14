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

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        const cwdConfigPath = path.join(process.cwd(), DEFAULT_CLI_ARGUMENTS.config);
        let cwdConfig: ConfigData;
        try {
            cwdConfig = await readJSON(cwdConfigPath) as ConfigData;
        } catch (error) {
            cwdConfig = {
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
                default: cwdConfig.storageAccount,
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "storageAccessKey",
                message: "Storage Account key:",
                default: cwdConfig.storageAccessKey,
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "storageHost",
                message: "Storage host address (optional):",
                default: cwdConfig.storageHost
            },
            {
                type: "confirm",
                name: "verbose",
                default: cwdConfig.verbose,
                message: "Verbose:"
            },
            {
                type: "input",
                name: "outDir",
                default: cwdConfig.outDir,
                message: "Save downloaded files to directory:",
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "retriesCount",
                default: cwdConfig.retriesCount,
                message: "Retries count:"
            },
            {
                type: "input",
                name: "configPath",
                default: process.cwd(),
                message: "Save config file to directory:",
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
