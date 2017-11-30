import { BlobService } from "azure-storage";
import { BaseManager } from "../abstractions/base-manager";
import { GetContainersList } from "../helpers/blob-helpers";

export class ContainerManager extends BaseManager<BlobService.ContainerResult> {

    /**
     * Retrieves next portion of container objects using current continuationToken.
     *
     * Returns next portion of container objects.
     *
     * Appends ContainerManager.Entries with fetched container objects.
     */
    public async Next(): Promise<BlobService.ContainerResult[]> {
        return this.getContainersList();
    }

    private async getContainersList(): Promise<BlobService.ContainerResult[]> {
        if (this.HasNext || !this.isInitialized) {
            this.isInitialized = true;
            const results = await GetContainersList(this.blobService, this.continuationToken, this.options);
            this.continuationToken = results.continuationToken;
            this.entries = this.entries.concat(...results.entries);
            return results.entries;
        } else {
            return this.entries;
        }
    }
}
