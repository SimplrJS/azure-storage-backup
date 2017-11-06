import * as fs from "fs-extra";
import * as path from "path";
import { BlobService, createBlobService } from "azure-storage";
import { CLIArgumentsObject, ConfigData, ContainersBlobs } from "./contracts";
import { DEFAULT_CLI_ARGUMENTS } from "./cli-arguments";
import { GetServiceProperties } from "../api/helpers/blob-helpers";
import { ContainerManager } from "../api/managers/container-manager";
import { Log } from "./cli-helpers";
import { BlobManager } from "../api/managers/blob-manager";
import { AsyncGenerator, AsyncManager } from "../api/promises/async-handler";

export class CLIHandler {
    constructor(private cliArguments: CLIArgumentsObject) {
        const configPath = typeof this.cliArguments.config === "string" ? this.cliArguments.config : DEFAULT_CLI_ARGUMENTS.config;
        this.configData = this.readConfig(path.join(process.cwd(), configPath));
        this.blobService = createBlobService(this.configData.storageAccount, this.configData.storageAccessKey, this.configData.storageHost);
        this.handleCLIAction();
    }

    private configData: ConfigData;
    private blobService: BlobService;
    private containerManager: ContainerManager;
    private blobsManagers: ContainersBlobs = {};

    private async handleCLIAction(): Promise<void> {
        try {
            this.checkServiceStatus();
            Log(`Successfully connected to Azure account "${this.configData.storageAccount}"`);

            this.containerManager = new ContainerManager(this.blobService);

            if (this.cliArguments.stats) {
                await this.loadAllContainers();
                await this.fetchBlobsData();
                this.outputStatistics();
            }
        } catch (error) {
            Log(error);
        }
    }

    private async loadAllContainers(): Promise<void> {
        await this.containerManager.FetchAll();
    }

    private async fetchBlobsData(): Promise<void> {
        const asyncFunctionArray: Array<AsyncGenerator<BlobService.BlobResult[]>> = [];
        for (const container of this.containerManager.Entries) {
            if (container != null) {
                const blobManager = new BlobManager(this.blobService, container.name);
                asyncFunctionArray.push(async () => blobManager.FetchAll());
                this.blobsManagers[container.name] = blobManager;
            }
        }

        const asyncManager = new AsyncManager<BlobService.BlobResult[]>(asyncFunctionArray);
        await asyncManager.Start();
    }

    private outputStatistics(): void {
        // TODO: implement.
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
            console.error(`Failed to connect to Storage account \"${this.configData.storageAccount}\": ${error}`);
        }
    }
}
