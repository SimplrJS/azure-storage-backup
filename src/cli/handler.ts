import * as fs from "fs-extra";
import * as path from "path";
import { BlobService, createBlobService } from "azure-storage";
import { CLIArgumentsObject, ConfigData } from "./contracts";
import { DEFAULT_CLI_ARGUMENTS } from "./arguments";
import { GetServiceProperties } from "../api/helpers/blob-helpers";

export class CLIHandler {
    constructor(private cliArguments: CLIArgumentsObject) {
        const configPath = typeof this.cliArguments.config === "string" ? this.cliArguments.config : DEFAULT_CLI_ARGUMENTS.config;
        this.configData = this.readConfig(path.join(process.cwd(), configPath));
        this.blobService = createBlobService(this.configData.StorageAccount, this.configData.StorageAccessKey, this.configData.StorageHost);
        this.handleCLIAction();
    }

    private configData: ConfigData;
    private blobService: BlobService;

    private handleCLIAction(): void {
        try {
            this.checkServiceStatus();
            console.log("Storage account data is valid.");
        } catch (error) {
            console.error(error);
        }
    }

    private readConfig(configPath: string): ConfigData {
        try {
            const configString = fs.readFileSync(configPath).toString();
            return JSON.parse(configString) as ConfigData;
        } catch (error) {
            throw new Error(`Failed to load config file from \"${configPath}\". ${error}`);
        }
    }

    private async checkServiceStatus(): Promise<void> {
        try {
            await GetServiceProperties(this.blobService);
        } catch (error) {
            console.error(`Failed to connect to Storage account \"${this.configData.StorageAccount}\": ${error}`);
        }
    }
}
