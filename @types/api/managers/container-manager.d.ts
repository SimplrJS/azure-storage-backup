import { BlobService } from "azure-storage";
import { BaseManager } from "../abstractions/base-manager";
export declare class ContainerManager extends BaseManager<BlobService.ContainerResult> {
    /**
     * Retrieves next portion of container objects using current continuationToken.
     *
     * Returns next portion of container objects.
     *
     * Appends ContainerManager.Entries with fetched container objects.
     */
    Next(): Promise<BlobService.ContainerResult[]>;
    private getContainersList();
}
