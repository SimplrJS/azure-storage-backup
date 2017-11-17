import * as Table from "cli-table2";
import { BlobService } from "azure-storage";
import { CommandModule } from "yargs";
import { EOL } from "os";

import {
    DefaultLogger,
    ResolveConfigPath,
    ReadConfig,
    IsContainerNameValid,
    BlobsListTableConfig,
    ConstructStatisticsTableRow
} from "../cli-helpers";
import { CLIArgumentsObject } from "../cli-contracts";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";
import { ContainerItemsList } from "../../api/managers/storage-account/storage-account-contracts";

class CheckWithAzureCommandClass implements CommandModule {
    public command: string = "check";

    public describe: string = "Checks correlation between data in Azure storage account and data in your outDir.";

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        try {
            const configPath = ResolveConfigPath(options.config);
            const config = ReadConfig(configPath, DefaultLogger);

            const storageAccountManager = new StorageAccountManager(config, DefaultLogger, options.noCache);
            await storageAccountManager.CheckServiceStatus();

            if (IsContainerNameValid(options.container)) {
                const missingContainerBlobsList = await storageAccountManager.ValidateContainerFiles(options.container);
                if (missingContainerBlobsList.length > 0) {
                    const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;
                    const row = ConstructStatisticsTableRow(options.container, missingContainerBlobsList, options.showInBytes);
                    table.push(row);
                    DefaultLogger.notice(EOL + table.toString());
                } else {
                    DefaultLogger.notice(`"${options.container}" has no missing blobs.`);
                }
            } else {
                const missingContainersBlobsList = await storageAccountManager.ValidateContainersFiles();
                const tableTitle = "Missing blobs found:";
                const outputString = this.constructMissingBlobsListsString(tableTitle, missingContainersBlobsList, options.showInBytes);
                DefaultLogger.notice(outputString);
            }
        } catch (error) {
            DefaultLogger.emergency(`Failed to check correlation between data.${EOL}${error}`);
        }
    }

    private constructMissingBlobsListsString(
        title: string,
        containersBlobsList: Array<ContainerItemsList<BlobService.BlobResult>>,
        showInBytes: boolean = false
    ): string {
        const table = new Table(BlobsListTableConfig) as Table.HorizontalTable;

        for (const blobsResultsList of containersBlobsList) {
            if (blobsResultsList.Entries.length > 0) {
                const row = ConstructStatisticsTableRow(blobsResultsList.ContainerName, blobsResultsList.Entries, showInBytes);
                table.push(row);
            }
        }

        return title + EOL + table.toString();
    }
}

export const CheckWithAzureCommand = new CheckWithAzureCommandClass;
