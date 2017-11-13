import { CommandModule } from "yargs";

import { DEFAULT_LOGGER, ResolveConfigPath, ReadConfig, IsContainerNameValid } from "../cli-helpers";
import { CLIArgumentsObject } from "../cli-contracts";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";

class CheckWithAzureCommandClass implements CommandModule {
    public command: string = "check";

    public describe: string = "Checks correlation between data in Azure storage account and data in your outDir.";

    public handler = async (options: CLIArgumentsObject): Promise<void> => {
        try {
            const configPath = ResolveConfigPath(options.config);
            const config = ReadConfig(configPath, DEFAULT_LOGGER);

            const storageAccountManager = new StorageAccountManager(config, DEFAULT_LOGGER, options.noCache);
            await storageAccountManager.CheckServiceStatus();

            if (IsContainerNameValid(options.container)) {
                await storageAccountManager.ValidateContainerFiles(options.container);
            } else {
                // Get blob container list, and check one by one.
                const containers = await storageAccountManager.FetchAllContainers();

                for (let i = 0; i < containers.length; i++) {
                    await storageAccountManager.ValidateContainerFiles(containers[i].name);
                }
            }
        } catch (error) {
            DEFAULT_LOGGER.emergency(`Failed to check correlation between data.`);
        }
    }
}

export const CheckWithAzureCommand = new CheckWithAzureCommandClass;
