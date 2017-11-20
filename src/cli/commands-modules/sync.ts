import * as Table from "cli-table2";
import { CommandModule } from "yargs";
import { EOL } from "os";
import { CLIArgumentsObject } from "../cli-contracts";
import {
    ResolveConfigPath,
    ReadConfig,
    DefaultLogger,
    IsContainerNameValid,
    BlobsListTableConfig,
    ConstructStatisticsTableRow
} from "../cli-helpers";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";
import { ContainersDownloadedBlobsResult } from "../../api/managers/storage-account/storage-account-contracts";

class SynchronizationCommandClass implements CommandModule {
    public command: string = "sync";

    public describe: string = "Synchronizes storage account content in Azure and your outDir.";

    public handler = async (options: CLIArgumentsObject) => {
        try {
            const configPath = ResolveConfigPath(options.config);
            const config = ReadConfig(configPath, DefaultLogger);

            const storageAccountManager = new StorageAccountManager(config, DefaultLogger, options.noCache);
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
                    DefaultLogger.notice(`Container downloads statistics:${EOL}${table}`);
                } else {
                    DefaultLogger.notice(`All container "${options.container}" blobs already downloaded.`);
                }
            } else {
                const downloadedContainersBlobs = await storageAccountManager.DownloadContainersBlobs();

                if (downloadedContainersBlobs.length === 0) {
                    DefaultLogger.notice(`Storage account "${config.storageAccount}" successfully synchronized.`);
                } else {
                    const succeededTitle = "Succeeded downloads statistics:";
                    const succeededListString = this.getSucceededBlobsListsString(succeededTitle, downloadedContainersBlobs);
                    DefaultLogger.notice(succeededListString);

                    const failureTitle = "Failed downloads statistics:";
                    const failuresListString = this.getFailedBlobsListsString(failureTitle, downloadedContainersBlobs);

                    if (failuresListString) {
                        DefaultLogger.notice(failuresListString);
                    }
                }
            }
        } catch (error) {
            DefaultLogger.critical(`Failed to download containers blobs. ${EOL}${error}`);
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

        return title + EOL + table;
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
