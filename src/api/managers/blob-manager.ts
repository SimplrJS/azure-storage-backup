import { BlobService } from "azure-storage";
import { GetBlobsList } from "../helpers/blob-helpers";
import { BaseManager } from "../abstractions/base-manager";

export class BlobManager extends BaseManager<BlobService.BlobResult> {
    constructor(
        protected blobService: BlobService,
        protected containerName: string,
        protected options?: BlobService.ListContainerOptions
    ) {
        super(blobService, options);
    }

    /**
     * Retrieves next portion of blobs using current continuationToken.
     *
     * Returns next portion of blobs.
     *
     * Appends BlobManager.Entries with fetched blobs.
     */
    public async Next(): Promise<BlobService.BlobResult[]> {
        return this.getBlobsList();
    }

    /**
     * Retrieves container name of blobs that are fetched.
     */
    public get ContainerName(): string {
        return this.containerName;
    }

    private async getBlobsList(): Promise<BlobService.BlobResult[]> {
        if (this.HasNext || !this.isInitialized) {
            this.isInitialized = true;
            const results = await GetBlobsList(this.blobService, this.containerName, this.continuationToken, this.options);
            this.continuationToken = results.continuationToken;
            this.entries = this.entries.concat(...results.entries);
            return results.entries;
        } else {
            return this.entries;
        }
    }
}
