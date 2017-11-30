import { CommandModule } from "yargs";
import { CLIArgumentsObject } from "../cli-contracts";
/**
 * CLI command `check` class.
 *
 * Checks if all blobs from Azure Storage were downloaded to your file system.
 */
export declare class CheckWithAzureCommandClass implements CommandModule {
    command: string;
    describe: string;
    handler: (options: CLIArgumentsObject) => Promise<void>;
    private constructMissingBlobsListsString(title, containersBlobsList, showInBytes?);
}
export declare const CheckWithAzureCommand: CheckWithAzureCommandClass;
