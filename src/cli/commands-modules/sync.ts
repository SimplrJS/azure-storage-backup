import * as Table from "cli-table2";
import { CommandModule } from "yargs";
import { EOL } from "os";
import { Logger } from "azure-storage";
import { CLIArgumentsObject } from "../cli-contracts";
import {
    ResolveConfigPath,
    ReadConfig,
    IsContainerNameValid,
    BlobsListTableConfig,
    ConstructStatisticsTableRow
} from "../cli-helpers";
import { CLILogger, AddFileMessageHandler } from "../logger/cli-logger";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";
import { ContainersDownloadedBlobsResult } from "../../api/managers/storage-account/storage-account-contracts";
/**
 * CLI command `sync` class.
 *
 * Downloads all blobs that are missing in your file system.
 */
class SynchronizationCommandClass implements CommandModule {
    public command: string = "sync";

    public describe: string = "Synchronizes storage account content in Azure and your outDir.";

    public handler = async (options: CLIArgumentsObject) => {
        try {
            const configPath = ResolveConfigPath(options.config);
            CLILogger.Info(`Reading config from "${configPath}".`);
            const config = ReadConfig(configPath);

            AddFileMessageHandler(config.logPath, config.noLogFile);

            try {
                const storageAccountManager = new StorageAccountManager(config, CLILogger, options.noCache);
                await storageAccountManager.CheckServiceStatus();

                if (IsContainerNameValid(options.container)) {
                    const downloadedContainerBlobs = await storageAccountManager.DownloadContainerBlobs(options.container);

                    if (downloadedContainerBlobs != null) {
                        const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;
                        const row = ConstructStatisticsTableRow(
                            options.container,
                            downloadedContainerBlobs.Succeeded,
                            options.showInBytes,
                            item => item.Result.Result
                        );
                        table.push(row);
                        CLILogger.Info(`Container downloads statistics:${EOL}${table.toString()}`);
                    } else {
                        CLILogger.Info(`All container "${options.container}" blobs already downloaded.`);
                    }
                } else {
                    const downloadedContainersBlobs = await storageAccountManager.DownloadContainersBlobs();

                    if (downloadedContainersBlobs.length === 0) {
                        CLILogger.Info(`Storage account "${config.storageAccount}" successfully synchronized.`);
                    } else {
                        const succeededTitle = "Succeeded downloads statistics:";
                        const succeededListString = this.getSucceededBlobsListsString(succeededTitle, downloadedContainersBlobs);
                        CLILogger.Info(succeededListString);

                        const failureTitle = "Failed downloads statistics:";
                        const failuresListString = this.getFailedBlobsListsString(failureTitle, downloadedContainersBlobs);

                        if (failuresListString) {
                            CLILogger.Info(failuresListString);
                        }
                    }
                }
            } catch (error) {
                CLILogger.Critical(`Failed to download containers blobs. ${EOL}${error}`);
            }
        } catch (configError) {
            CLILogger.Critical(Logger.LogLevels.CRITICAL, configError);
        }
    }

    private getSucceededBlobsListsString(
        title: string,
        containerDownloadsList: ContainersDownloadedBlobsResult,
        showInBytes: boolean = false
    ): string {
        const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;

        for (const containerResultsList of containerDownloadsList) {
            const row = ConstructStatisticsTableRow(
                // Context is always defined when downloading container blobs.
                containerResultsList.Context!.ContainerName,
                containerResultsList.Succeeded,
                showInBytes,
                item => item.Result.Result
            );
            table.push(row);
        }

        return title + EOL + table.toString();
    }

    private getFailedBlobsListsString(
        title: string,
        containerDownloadsList: ContainersDownloadedBlobsResult,
        showInBytes: boolean = false
    ): string | undefined {
        let hasFailedDownloads = false;
        let finalString = title + EOL;

        for (const containerResultList of containerDownloadsList) {
            if (containerResultList.Failed.length > 0) {
                if (!hasFailedDownloads) {
                    hasFailedDownloads = true;
                }

                // Context is always defined when downloading container blobs.
                finalString += `Failed blobs of "${containerResultList.Context!.ContainerName}":${EOL}`;
                for (const failedBlob of containerResultList.Failed) {
                    finalString += `    ${failedBlob.Data.name}:${EOL}*    ${failedBlob.Error}${EOL}`;
                }
            }
        }

        return (hasFailedDownloads) ? finalString : undefined;
    }
}

export const SynchronizationCommand = new SynchronizationCommandClass;
