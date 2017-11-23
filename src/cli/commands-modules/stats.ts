import * as Table from "cli-table2";
import { CommandModule, CommandBuilder } from "yargs";
import { EOL } from "os";
import { BlobService, Logger } from "azure-storage";

import { CLIArgumentsObject } from "../cli-contracts";
import {
    ReadConfig,
    ResolveConfigPath,
    IsContainerNameValid,
    BlobsListTableConfig,
    ConstructStatisticsTableRow,
    DefaultBlobResultGetter,
    ConstructDefaultLogger,
    ConstructLogLine
} from "../cli-helpers";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";
import { PromiseDto } from "../../api/promises/async-manager";

export interface StatisticsCommandOptions extends CLIArgumentsObject {
    showInBytes: boolean;
}

class StatisticsCommandClass implements CommandModule {
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
            console.info(`Reading config from "${configPath}".`);
            const config = ReadConfig(configPath);

            const logger = ConstructDefaultLogger(config.logPath);

            try {
                const storageAccountManager = new StorageAccountManager(config, logger, options.noCache);
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
                    logger.notice(EOL + table);
                } else {
                    const containersBlobs = await storageAccountManager.FetchContainersBlobsList();
                    const successTitle = `Successfully fetched blobs lists (${containersBlobs.Succeeded.length}):`;
                    const successOutputString = this.logSucceededBlobsLists(successTitle, containersBlobs.Succeeded, options.showInBytes);
                    logger.notice(successOutputString);

                    if (containersBlobs.Failed.length > 0) {
                        const failureTitle = `Failed to fetch ${containersBlobs.Failed.length} blobs lists:`;
                        const failureOutputString = this.logFailedBlobsLists(failureTitle, containersBlobs.Failed, options.showInBytes);
                        logger.notice(failureOutputString);
                    }
                }
            } catch (error) {
                console.error(ConstructLogLine(Logger.LogLevels.CRITICAL, `Failed to get statistics of a storage account. ${EOL}${error}`));
            }

        } catch (configError) {
            console.error(configError);
        }
    }

    private logFailedBlobsLists(
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

    private logSucceededBlobsLists(
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

        return title + EOL + table;
    }
}

export const StatisticsCommand = new StatisticsCommandClass;
