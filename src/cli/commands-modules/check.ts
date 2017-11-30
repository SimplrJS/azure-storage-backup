import * as Table from "cli-table2";
import { BlobService } from "azure-storage";
import { CommandModule } from "yargs";
import { EOL } from "os";

import {
    ResolveConfigPath,
    ReadConfig,
    IsContainerNameValid,
    BlobsListTableConfig,
    ConstructStatisticsTableRow,
    DefaultBlobResultGetter
} from "../cli-helpers";
import { CLIArgumentsObject } from "../cli-contracts";
import { CLILogger, AddFileMessageHandler } from "../logger/cli-logger";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";
import { ContainerItemsList } from "../../api/managers/storage-account/storage-account-contracts";

/**
 * CLI command `check` class.
 *
 * Checks if all blobs from Azure Storage were downloaded to your file system.
 */
export class CheckWithAzureCommandClass implements CommandModule {
    public command: string = "check";

    public describe: string = "Checks correlation between data in Azure storage account and data in your outDir.";

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        try {
            const configPath = ResolveConfigPath(options.config);
            CLILogger.Info(`Reading config from "${configPath}".`);
            const config = ReadConfig(configPath);

            AddFileMessageHandler(config.logPath, config.noLogFile);

            try {

                const storageAccountManager = new StorageAccountManager(config, CLILogger, options.noCache);
                await storageAccountManager.CheckServiceStatus();

                if (IsContainerNameValid(options.container)) {
                    const missingContainerBlobsList = await storageAccountManager.ValidateContainerFiles(options.container);
                    if (missingContainerBlobsList.length > 0) {
                        const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;
                        const row = ConstructStatisticsTableRow(
                            options.container,
                            missingContainerBlobsList,
                            options.showInBytes,
                            DefaultBlobResultGetter
                        );
                        table.push(row);
                        CLILogger.Info(`Check statistics:${EOL}${table.toString()}`);
                    } else {
                        CLILogger.Info(`"${options.container}" has no missing blobs.`);
                    }
                } else {
                    const missingContainersBlobsList = await storageAccountManager.ValidateContainersFiles();
                    const tableTitle = "Missing blobs found:";
                    const outputString = this.constructMissingBlobsListsString(tableTitle, missingContainersBlobsList, options.showInBytes);
                    CLILogger.Info(outputString);
                }
            } catch (error) {
                CLILogger.Critical(`Failed to check correlation between data.${EOL}${error}`);
            }
        } catch (configError) {
            CLILogger.Critical(configError);
        }
    }

    private constructMissingBlobsListsString(
        title: string,
        containersBlobsList: Array<ContainerItemsList<BlobService.BlobResult>>,
        showInBytes: boolean = false
    ): string {
        const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;
        let hasMissingBlobs = false;

        for (const blobsResultsList of containersBlobsList) {
            if (blobsResultsList.Entries.length > 0) {
                if (!hasMissingBlobs) {
                    hasMissingBlobs = true;
                }

                const row = ConstructStatisticsTableRow(
                    blobsResultsList.ContainerName,
                    blobsResultsList.Entries,
                    showInBytes,
                    DefaultBlobResultGetter
                );
                table.push(row);
            }
        }

        if (hasMissingBlobs) {
            return title + EOL + table.toString();
        } else {
            return "No missing blobs found.";
        }
    }
}

export const CheckWithAzureCommand = new CheckWithAzureCommandClass;
