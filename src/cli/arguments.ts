import * as fs from "fs-extra";
import * as path from "path";
import { BasePackage, CLIArgumentsObject } from "src/cli/contracts";
import * as yargs from "yargs";

const PACKAGE_JSON_PATH = "../../package.json";

function GetVersion(): string {
    const resultString = fs.readFileSync(path.join(__dirname, PACKAGE_JSON_PATH)).toString();
    const packageData = JSON.parse(resultString) as BasePackage;
    return packageData.version;
}

export const CLIArguments = yargs
    .help("h", "Show help")
    .alias("h", "help")
    .version(`Current version: ${GetVersion()}`)
    .alias("v", "version")
    .option("config", {
        describe: "Relative path to config file",
        type: "string"
    }).argv as CLIArgumentsObject;

export const DEFAULT_CLI_ARGUMENTS = {
    config: "./extractor.config.json"
};
