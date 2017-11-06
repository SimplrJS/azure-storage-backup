import * as fs from "fs-extra";
import * as path from "path";
import { BasePackage, CLIArgumentsObject } from "src/cli/contracts";
import * as yargs from "yargs";

const PACKAGE_JSON_PATH = "../../package.json";

function GetVersion(): string {
    const packageData = fs.readJsonSync(path.join(__dirname, PACKAGE_JSON_PATH)) as BasePackage;
    return packageData.version;
}

export const CLIArguments = yargs
    .help("h", "Show help")
    .alias("h", "help")
    .version(`Current version: ${GetVersion()}`)
    .alias("v", "version")
    .option("config", {
        describe: "Relative path to config file.",
        type: "string"
    })
    .option("sync", {
        describe: "Synchronizes storage account content in Azure and your outDir.",
        type: "boolean"
    })
    .option("container", {
        describe: "Performs an action on a specific container instead of all Azure storage account.",
        type: "string"
    })
    .option("check", {
        describe: "Checks correlation between data in Azure storage account and data in your outDir.",
        type: "boolean"
    })
    .option("logDir", {
        describe: "Directory of logs file.",
        type: "string"
    })
    .option("retryFailed", {
        describe: "Should retry download if error occurred or blob size in Azure container does not match to downloaded blob size.",
        type: "boolean"
    })
    .option("stats", {
        describe: "Retrieves statistics of a Storage account or a container",
        type: "boolean"
    })
    .argv as CLIArgumentsObject;

export const DEFAULT_CLI_ARGUMENTS = {
    config: "./extractor.config.json"
};
