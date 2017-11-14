import { CommandModule } from "yargs";
import { EOL } from "os";
import { CLIArgumentsObject } from "../cli-contracts";
import { ResolveConfigPath, ReadConfig, DefaultLogger, IsContainerNameValid } from "../cli-helpers";
import { StorageAccountManager } from "../../api/managers/storage-account/storage-account-manager";

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
                await storageAccountManager.DownloadContainerBlobs(options.container);
            } else {
                // Get blob container list, and check one by one.
                const containers = await storageAccountManager.FetchAllContainers();

                for (let i = 0; i < containers.length; i++) {
                    await storageAccountManager.DownloadContainerBlobs(containers[i].name);
                }
            }
        } catch (error) {
            DefaultLogger.critical(`Failed to download containers blobs. ${EOL}${error}`);
        }
    }
}

export const SynchronizationCommand = new SynchronizationCommandClass;
