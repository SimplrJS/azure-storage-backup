import { CommandModule } from "yargs";

import { CLIArgumentsObject } from "../cli-contracts";
import { ReadConfig, ResolveConfigPath, DEFAULT_LOGGER, IsContainerNameValid } from "../cli-helpers";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";

class StatisticsCommandClass implements CommandModule {
    public command: string = "stats";

    public describe: string = "Retrieves statistics of a Storage account or a container.";

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        try {
            const configPath = ResolveConfigPath(options.config);
            const config = ReadConfig(configPath, DEFAULT_LOGGER);

            const storageAccountManager = new StorageAccountManager(config, DEFAULT_LOGGER, options.noCache);
            await storageAccountManager.CheckServiceStatus();

            await storageAccountManager.FetchAllContainers();

            if (IsContainerNameValid(options.container)) {
                await storageAccountManager.FetchContainerBlobsList(options.container);
            } else {
                await storageAccountManager.FetchContainersBlobsList();
            }

        } catch (error) {
            DEFAULT_LOGGER.emergency(`Failed to get statistics of a storage account.`);
        }
    }
}

export const StatisticsCommand = new StatisticsCommandClass;
