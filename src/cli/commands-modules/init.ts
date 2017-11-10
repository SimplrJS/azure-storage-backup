// This module is designed to work with "Yargs" (https://github.com/yargs/yargs)
// File structure is restricted by requirements of Yargs Module:
//      https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module

import * as path from "path";
import { prompt, Questions } from "inquirer";
import { CommandBuilder } from "yargs";
import { writeJSON } from "fs-extra";
import { CommandHandler, ConfigData } from "../contracts";

export enum ConnectionType {
    AccountNameAndKey = "accountNameAndKey",
    ConnectionString = "connectionString"
}

export const command: string = "init";

export const describe: string = "Run configuration prompts.";

export const builder: CommandBuilder = {};

export const requireNotEmpty = (value: string) => {
    if (value !== "") {
        return true;
    }
    return "Value is empty.";
};

export const handler: CommandHandler = async () => {
    const azureStorageQuestions: Questions = [
        {
            type: "input",
            name: "storageAccount",
            message: "Storage Account name:",
            validate: requireNotEmpty
        },
        {
            type: "input",
            name: "storageAccessKey",
            message: "Storage Account key:",
            validate: requireNotEmpty
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
            message: "Save downloaded files to directory:"
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
            message: "Save config file to directory:"
        }
    ];
    const azureStorageAnswers = await prompt(azureStorageQuestions);

    const config: ConfigData = {
        storageAccount: azureStorageAnswers.storageAccount,
        storageAccessKey: azureStorageAnswers.storageAccessKey,
        storageHost: azureStorageAnswers.storageHost || undefined,
        verbose: azureStorageAnswers.verbose,
        outDir: azureStorageAnswers.outDir || process.cwd(),
        retriesCount: azureStorageAnswers.retriesCount
    };

    const configPath: string = azureStorageAnswers.configPath;
    const resolvedConfigPath: string = configPath.trim() || process.cwd();
    const outputPath = path.join(resolvedConfigPath, "exporter.config.json");

    try {
        await writeJSON(outputPath, config);
        console.log("Successfully saved config to:", outputPath);
    } catch (error) {
        console.error(error);
    }
};
