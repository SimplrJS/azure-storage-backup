import { CommandModule } from "yargs";
import { CLIArgumentsObject } from "../cli-contracts";
import { ConfigData } from "../../api/managers/storage-account/storage-account-contracts";
export declare enum ConnectionType {
    AccountNameAndKey = "accountNameAndKey",
    ConnectionString = "connectionString",
}
export interface AzureStorageAnswersDto extends ConfigData {
    configPath: string;
}
/**
 * CLI command `init` class.
 *
 * Generates a configuration file.
 */
export declare class ConfigInitializationCommandClass implements CommandModule {
    command: string;
    describe: string;
    private requireNotEmpty;
    private requirePositiveInteger;
    private readonly defaultConfigValues;
    handler: (options: CLIArgumentsObject) => Promise<void>;
}
export declare const ConfigInitializationCommand: ConfigInitializationCommandClass;
