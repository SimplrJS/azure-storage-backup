#!/usr/bin/env node
import * as yargs from "yargs";

import { StatisticsCommand } from "./commands-modules/stats";
import { SynchronizationCommand } from "./commands-modules/sync";
import { CheckWithAzureCommand } from "./commands-modules/check";
import { ConfigInitializationCommand } from "./commands-modules/init";
import { CLIArgumentsObject } from "./cli-contracts";
import { GetVersion } from "./cli-helpers";

/**
 * Handles all CLI commands and arguments.
 */
export const CLIHandler = yargs
    .showHelpOnFail(true)
    .demandCommand(1, "You need at least one command before moving on")
    .help("h", "Show help")
    .alias("h", "help")
    .version(`Current version: ${GetVersion()}`)
    .alias("v", "version")
    // CLI options
    .option("config", {
        describe: "Config file path.",
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

    // CLI commands:
    .command(SynchronizationCommand)
    .command(CheckWithAzureCommand)
    .command(StatisticsCommand)
    .command(ConfigInitializationCommand)
    .argv as CLIArgumentsObject;
