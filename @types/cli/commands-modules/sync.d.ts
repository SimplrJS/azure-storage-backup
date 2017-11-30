import { CommandModule } from "yargs";
import { CLIArgumentsObject } from "../cli-contracts";
/**
 * CLI command `sync` class.
 *
 * Downloads all blobs that are missing in your file system.
 */
export declare class SynchronizationCommandClass implements CommandModule {
    command: string;
    describe: string;
    handler: (options: CLIArgumentsObject) => Promise<void>;
    private getSucceededBlobsListsString(title, containerDownloadsList, showInBytes?);
    private getFailedBlobsListsString(title, containerDownloadsList, showInBytes?);
}
export declare const SynchronizationCommand: SynchronizationCommandClass;
