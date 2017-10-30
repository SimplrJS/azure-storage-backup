import { BlobService, common } from "azure-storage";
import { GetBlobsList } from "../helpers/blob-helpers";

export class BlobManager {
    constructor(private blobService: BlobService, private containerName: string, private options?: BlobService.ListContainerOptions) { }

    private continuationToken: common.ContinuationToken | undefined;
    private entries: BlobService.BlobResult[] = [];
    private isInitialized: boolean = false;

    public get HasNext(): boolean {
        return Boolean(this.continuationToken);
    }

    public Clear(): void {
        this.continuationToken = undefined;
        this.entries = [];
    }

    public Next(): Promise<BlobService.BlobResult[]> {
        return this.getBlobsList();
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

    public get Entries(): BlobService.BlobResult[] {
        return this.entries;
    }

    public get ContinuationToken(): common.ContinuationToken | undefined {
        return this.continuationToken;
    }

    public get IsFinished(): boolean {
        return !this.HasNext;
    }
}
