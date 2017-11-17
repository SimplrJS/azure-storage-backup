import { CommandModule } from "yargs";
import { EOL } from "os";

import { DefaultLogger, ResolveConfigPath, ReadConfig, IsContainerNameValid } from "../cli-helpers";
import { CLIArgumentsObject } from "../cli-contracts";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";

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
                await storageAccountManager.ValidateContainerFiles(options.container);
            } else {
                await storageAccountManager.ValidateContainersFiles();
            }
        } catch (error) {
            DefaultLogger.emergency(`Failed to check correlation between data.${EOL}${error}`);
        }
    }
}

export const CheckWithAzureCommand = new CheckWithAzureCommandClass;
