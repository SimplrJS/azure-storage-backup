import * as path from "path";
import { prompt, Questions } from "inquirer";
import { CommandModule } from "yargs";
import { writeJSON } from "fs-extra";
import { CLIArgumentsObject } from "../cli-contracts";
import { ConfigData } from "../../api/managers/storage-account/storage-account-contracts";

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
        const azureStorageQuestions: Questions = [
            {
                type: "input",
                name: "storageAccount",
                message: "Storage Account name:",
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "storageAccessKey",
                message: "Storage Account key:",
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "storageHost",
                message: "Storage host address (optional):"
            },
            {
                type: "confirm",
                name: "verbose",
                default: false,
                message: "Verbose:"
            },
            {
                type: "input",
                name: "outDir",
                default: process.cwd(),
                message: "Save downloaded files to directory:",
                validate: this.requireNotEmpty
            },
            {
                type: "input",
                name: "retriesCount",
                default: 5,
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

        const outputPath = path.join(configPath, "exporter.config.json");

        try {
            await writeJSON(outputPath, config);
            console.log("Successfully saved config to:", outputPath);
        } catch (error) {
            console.error(error);
        }
    }
}

export const ConfigInitializationCommand = new ConfigInitializationCommandClass;
