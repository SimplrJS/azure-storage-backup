import { BlobService, common } from "azure-storage";
/**
 * Base manager to fetch and store Azure data with continuation token.
 */
export declare abstract class BaseManager<TItemType> {
    protected blobService: BlobService;
    protected options: BlobService.ListContainerOptions | undefined;
    constructor(blobService: BlobService, options?: BlobService.ListContainerOptions | undefined);
    protected continuationToken: common.ContinuationToken | undefined;
    /**
     * Entries fetched from Azure Storage account.
     */
    protected entries: TItemType[];
    /**
     * Defines if data fetching started.
     */
    protected isInitialized: boolean;
    /**
     * Defines if there are more data to fetch.
     */
    readonly HasNext: boolean;
    /**
     * Clears all data fetched by manager.
     */
    Clear(): void;
    /**
     * Starts fetching next portion of data.
     */
    abstract Next(): Promise<TItemType[]>;
    /**
     * Retrieves all entries fetched by now.
     */
    readonly Entries: TItemType[];
    /**
     * Retrieves count of all entries fetched by now.
     */
    readonly Count: number;
    /**
     * Retrieves continuation token.
     */
    readonly ContinuationToken: common.ContinuationToken | undefined;
    /**
     * Defines if all the values have been fetched.
     */
    readonly IsFinished: boolean;
    /**
     * Defines if data fetching has started.
     */
    readonly IsInitialized: boolean;
    /**
     * Fetches all data using Next().
     */
    FetchAll(): Promise<TItemType[]>;
}
