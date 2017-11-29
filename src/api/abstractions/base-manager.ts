import { BlobService, common } from "azure-storage";

/**
 * Base manager to fetch and store Azure data with continuation token.
 */
export abstract class BaseManager<TItemType> {
    constructor(
        protected blobService: BlobService,
        protected options?: BlobService.ListContainerOptions
    ) { }

    protected continuationToken: common.ContinuationToken | undefined;

    /**
     * Entries fetched from Azure Storage account.
     */
    protected entries: TItemType[] = [];

    /**
     * Defines if data fetching started.
     */
    protected isInitialized: boolean = false;

    /**
     * Defines if there are more data to fetch.
     */
    public get HasNext(): boolean {
        return Boolean(this.continuationToken);
    }

    /**
     * Clears all data fetched by manager.
     */
    public Clear(): void {
        this.continuationToken = undefined;
        this.entries = [];
        this.isInitialized = false;
    }

    /**
     * Starts fetching next portion of data.
     */
    public abstract async Next(): Promise<TItemType[]>;

    /**
     * Retrieves all entries fetched by now.
     */
    public get Entries(): TItemType[] {
        return this.entries;
    }

    /**
     * Retrieves count of all entries fetched by now.
     */
    public get Count(): number {
        return this.entries.length;
    }

    /**
     * Retrieves continuation token.
     */
    public get ContinuationToken(): common.ContinuationToken | undefined {
        return this.continuationToken;
    }

    /**
     * Defines if all the values have been fetched.
     */
    public get IsFinished(): boolean {
        return !this.HasNext;
    }

    /**
     * Defines if data fetching has started.
     */
    public get IsInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * Fetches all data using Next().
     */
    public async FetchAll(): Promise<TItemType[]> {
        while (!this.IsInitialized || this.HasNext) {
            await this.Next();
        }

        return this.entries;
    }
}
