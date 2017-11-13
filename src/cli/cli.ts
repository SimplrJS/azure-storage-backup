#!/usr/bin/env node
import { CLIArgumentsObject } from "src/cli/cli-contracts";
import * as yargs from "yargs";

import { StatisticsCommand } from "./commands-modules/stats";
import { SynchronizationCommand } from "./commands-modules/sync";
import { CheckWithAzureCommand } from "./commands-modules/check";
import { ConfigInitializationCommand } from "./commands-modules/init";
import { GetVersion } from "./cli-helpers";

export const CLIArguments = yargs
    .help("h", "Show help")
    .alias("h", "help")
    .version(`Current version: ${GetVersion()}`)
    .alias("v", "version")
    // CLI options
    .option("config", {
        describe: "Relative path from current working directory to config file.",
        type: "string"
    })
    .option("container", {
        describe: "Performs an action on a specific container instead of all Azure storage account.",
        type: "string"
    })
    .option("noCache", {
        describe: "Prevents using cached values from previously performed actions.",
        type: "boolean"
    })
    .option("logPath", {
        describe: "Relative path from current working directory to log file.",
        type: "string"
    })

    // CLI commands:
    .command(SynchronizationCommand)
    .command(CheckWithAzureCommand)
    .command(StatisticsCommand)
    .command(ConfigInitializationCommand)
    .argv as CLIArgumentsObject;
