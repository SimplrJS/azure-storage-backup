import { BlobService, common } from "azure-storage";

export abstract class BaseManager<TItemType> {
    constructor(
        protected blobService: BlobService,
        protected options?: BlobService.ListContainerOptions
    ) { }

    protected continuationToken: common.ContinuationToken | undefined;
    protected entries: TItemType[] = [];
    protected isInitialized: boolean = false;

    public get HasNext(): boolean {
        return Boolean(this.continuationToken);
    }

    public Clear(): void {
        this.continuationToken = undefined;
        this.entries = [];
    }

    public abstract Next(): Promise<TItemType[]>;

    public get Entries(): TItemType[] {
        return this.entries;
    }

    public get ContinuationToken(): common.ContinuationToken | undefined {
        return this.continuationToken;
    }

    public get IsFinished(): boolean {
        return !this.HasNext;
    }

    public get IsInitialized(): boolean {
        return this.isInitialized;
    }
}
