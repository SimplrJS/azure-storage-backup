import { BlobService } from "azure-storage";
import { BaseManager } from "../abstractions/base-manager";
export declare class BlobManager extends BaseManager<BlobService.BlobResult> {
    protected blobService: BlobService;
    protected containerName: string;
    protected options: BlobService.ListContainerOptions | undefined;
    constructor(blobService: BlobService, containerName: string, options?: BlobService.ListContainerOptions | undefined);
    /**
     * Retrieves next portion of blobs using current continuationToken.
     *
     * Returns next portion of blobs.
     *
     * Appends BlobManager.Entries with fetched blobs.
     */
    Next(): Promise<BlobService.BlobResult[]>;
    /**
     * Retrieves container name of blobs that are fetched.
     */
    readonly ContainerName: string;
    private getBlobsList();
}
