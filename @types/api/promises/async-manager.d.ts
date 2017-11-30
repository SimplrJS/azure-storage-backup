export declare type PromiseHandler<TData, TResult = void, TContext = void> = (data: TData, context: TContext) => Promise<TResult>;
export declare type PromiseNotifier = (total: number, finished: number) => void;
export interface PromiseDto<TData, TResult> {
    Data: TData;
    Status: PromiseStatus;
    RetriesCount: number;
    Error?: any;
    Result: TResult;
}
export interface AsyncSessionResultDto<TData, TResult, TContext = void> {
    Succeeded: Array<PromiseDto<TData, TResult>>;
    Failed: Array<PromiseDto<TData, undefined>>;
    Context?: TContext;
}
export declare enum PromiseStatus {
    Init = 0,
    Failed = 16,
    Succeeded = 32,
}
export declare class AsyncManager<TData, TResult = void, TContext = void> {
    private handler;
    private promisesConcurrently;
    private maxRetries;
    private throwOnError;
    constructor(handler: PromiseHandler<TData, TResult, TContext | undefined>, promisesConcurrently?: number, maxRetries?: number, throwOnError?: boolean);
    /**
     * Total count of objects supplied to manager.
     */
    readonly TotalCount: number;
    /**
     * Succeeded promises count.
     */
    readonly SucceededCount: number;
    /**
     * Failed promises count.
     */
    readonly FailedCount: number;
    /**
     * Finished promises count.
     */
    readonly FinishedCount: number;
    /**
     * Failed promises objects list.
     */
    readonly FailedPromises: Array<PromiseDto<TData, undefined>>;
    /**
     * Succeeded promises objects list.
     */
    readonly SucceededPromises: Array<PromiseDto<TData, TResult>>;
    /**
     * Callback triggered after single promise finished.
     */
    OnSinglePromiseFinished: PromiseNotifier;
    private onSinglePromiseFinished;
    private resolve;
    private reject;
    private pointerPosition;
    private activePromises;
    private promisesData;
    private succeededPromiseIndexes;
    private failedPromiseIndexes;
    private isStarted;
    private hasFailed;
    /**
     * Is manager started resolving promises.
     */
    readonly IsStarted: boolean;
    /**
     * Has manager failed to resolve promises.
     */
    readonly HasFailed: boolean;
    private context;
    /**
     * Retrieves context object.
     */
    /**
     * Sets context object, that will be available in promise function.
     */
    Context: TContext | undefined;
    private reset();
    /**
     * Creates async function for every object supplied in promisesDate.
     */
    Start(promisesData: TData[], context?: TContext): Promise<AsyncSessionResultDto<TData, TResult, TContext>>;
    private activatePromises();
    private handlePromise(index);
}
