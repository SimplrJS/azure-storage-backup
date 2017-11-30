import * as Table from "cli-table2";
import { CommandModule, CommandBuilder } from "yargs";
import { EOL } from "os";
import { BlobService } from "azure-storage";

import { CLIArgumentsObject } from "../cli-contracts";
import {
    ReadConfig,
    ResolveConfigPath,
    IsContainerNameValid,
    BlobsListTableConfig,
    ConstructStatisticsTableRow,
    DefaultBlobResultGetter
} from "../cli-helpers";
import { CLILogger, AddFileMessageHandler } from "../logger/cli-logger";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";
import { PromiseDto } from "../../api/promises/async-manager";

export interface StatisticsCommandOptions extends CLIArgumentsObject {
    showInBytes: boolean;
}
/**
 * CLI command `stats` class.
 *
 * Provides a statistics about blobs in Azure Storage account containers.
 */
export class StatisticsCommandClass implements CommandModule {
    public command: string = "stats";

    public describe: string = "Retrieves statistics of a Storage account or a container.";

    public builder: CommandBuilder = {
        showInBytes: {
            default: false,
            type: "boolean"
        }
    };

    public handler = async (options: StatisticsCommandOptions): Promise<void> => {
        try {
            const configPath = ResolveConfigPath(options.config);

            CLILogger.Info(`Reading config from "${configPath}".`);
            const config = ReadConfig(configPath);

            AddFileMessageHandler(config.logPath, config.noLogFile);

            try {
                const storageAccountManager = new StorageAccountManager(config, CLILogger, options.noCache);
                await storageAccountManager.CheckServiceStatus();

                if (IsContainerNameValid(options.container)) {
                    const containerBlobs = await storageAccountManager.FetchContainerBlobsList(options.container);
                    const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;
                    const row = ConstructStatisticsTableRow(
                        options.container,
                        containerBlobs,
                        options.showInBytes,
                        DefaultBlobResultGetter
                    );
                    table.push(row);
                    CLILogger.Info(EOL + table.toString());
                } else {
                    const containersBlobs = await storageAccountManager.FetchContainersBlobsList();
                    const successfullyFetchedListTitle = `Successfully fetched blobs lists (${containersBlobs.Succeeded.length}):`;
                    const successOutputString = this.resolveSucceededBlobsListsTableString(
                        successfullyFetchedListTitle,
                        containersBlobs.Succeeded,
                        options.showInBytes
                    );
                    CLILogger.Info(successOutputString);

                    if (containersBlobs.Failed.length > 0) {
                        const failureTitle = `Failed to fetch ${containersBlobs.Failed.length} blobs lists:`;
                        const failureOutputString = this.resolveFailedBlobsListsTableString(
                            failureTitle,
                            containersBlobs.Failed,
                            options.showInBytes
                        );
                        CLILogger.Info(failureOutputString);
                    }
                }
            } catch (error) {
                CLILogger.Critical("Failed to get statistics of a storage account.", EOL, error);
            }

        } catch (configError) {
            console.error(configError);
        }
    }

    private resolveFailedBlobsListsTableString(
        title: string,
        failuresList: Array<PromiseDto<BlobService.ContainerResult, undefined>>,
        showInBytes: boolean = false
    ): string {
        let finalString = title + EOL;

        for (const blobsResultList of failuresList) {
            finalString += `${blobsResultList.Data.name}:${EOL}*     ${blobsResultList.Error}`;
        }

        return finalString;
    }

    private resolveSucceededBlobsListsTableString(
        title: string,
        containersBlobsList: Array<PromiseDto<BlobService.ContainerResult, BlobService.BlobResult[]>>,
        showInBytes: boolean = false
    ): string {
        const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;

        for (const blobsResultsList of containersBlobsList) {
            const row = ConstructStatisticsTableRow(
                blobsResultsList.Data.name,
                blobsResultsList.Result,
                showInBytes,
                DefaultBlobResultGetter
            );
            table.push(row);
        }

        return title + EOL + table.toString();
    }
}

export const StatisticsCommand = new StatisticsCommandClass;
