import { CommandModule, CommandBuilder } from "yargs";
import { CLIArgumentsObject } from "../cli-contracts";
export interface StatisticsCommandOptions extends CLIArgumentsObject {
    showInBytes: boolean;
}
/**
 * CLI command `stats` class.
 *
 * Provides a statistics about blobs in Azure Storage account containers.
 */
export declare class StatisticsCommandClass implements CommandModule {
    command: string;
    describe: string;
    builder: CommandBuilder;
    handler: (options: StatisticsCommandOptions) => Promise<void>;
    private resolveFailedBlobsListsTableString(title, failuresList, showInBytes?);
    private resolveSucceededBlobsListsTableString(title, containersBlobsList, showInBytes?);
}
export declare const StatisticsCommand: StatisticsCommandClass;
