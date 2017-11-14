import { CommandModule } from "yargs";

import { CLIArgumentsObject } from "../cli-contracts";
import { ReadConfig, ResolveConfigPath, DefaultLogger, IsContainerNameValid } from "../cli-helpers";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";

class StatisticsCommandClass implements CommandModule {
    public command: string = "stats";

    public describe: string = "Retrieves statistics of a Storage account or a container.";

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        try {
            const configPath = ResolveConfigPath(options.config);
            const config = ReadConfig(configPath, DefaultLogger);

            const storageAccountManager = new StorageAccountManager(config, DefaultLogger, options.noCache);
            await storageAccountManager.CheckServiceStatus();

            await storageAccountManager.FetchAllContainers();

            if (IsContainerNameValid(options.container)) {
                await storageAccountManager.FetchContainerBlobsList(options.container);
            } else {
                await storageAccountManager.FetchContainersBlobsList();
            }

        } catch (error) {
            DefaultLogger.emergency(`Failed to get statistics of a storage account.`);
        }
    }
}

export const StatisticsCommand = new StatisticsCommandClass;
