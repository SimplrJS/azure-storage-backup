export type PromiseHandler<TData, TResult = void, TContext = void> = (data: TData, context: TContext) => Promise<TResult>;
export type PromiseNotifier = (total: number, finished: number) => void;

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

export enum PromiseStatus {
    Init = 0,
    Failed = 16,
    Succeeded = 32
}

export class AsyncManager<TData, TResult = void, TContext = void> {
    constructor(
        private handler: PromiseHandler<TData, TResult, TContext | undefined>,
        private promisesConcurrently: number = 30,
        private maxRetries: number = 3,
        private throwOnError: boolean = false
    ) { }

    /**
     * Total count of objects supplied to manager.
     */
    public get TotalCount(): number {
        return this.promisesData.length;
    }

    /**
     * Succeeded promises count.
     */
    public get SucceededCount(): number {
        return this.succeededPromiseIndexes.length;
    }

    /**
     * Failed promises count.
     */
    public get FailedCount(): number {
        return this.failedPromiseIndexes.length;
    }

    /**
     * Finished promises count.
     */
    public get FinishedCount(): number {
        return this.SucceededCount + this.FailedCount;
    }

    /**
     * Failed promises objects list.
     */
    public get FailedPromises(): Array<PromiseDto<TData, undefined>> {
        return this.failedPromiseIndexes.map(index => this.promisesData[index]) as Array<PromiseDto<TData, undefined>>;
    }

    /**
     * Succeeded promises objects list.
     */
    public get SucceededPromises(): Array<PromiseDto<TData, TResult>> {
        return this.succeededPromiseIndexes.map(index => this.promisesData[index]) as Array<PromiseDto<TData, TResult>>;
    }

    /**
     * Callback triggered after single promise finished.
     */
    public set OnSinglePromiseFinished(notifier: PromiseNotifier) {
        this.onSinglePromiseFinished = notifier;
    }

    private onSinglePromiseFinished: PromiseNotifier | undefined;

    private resolve: (
        value?: AsyncSessionResultDto<TData, TResult, TContext> |
            PromiseLike<AsyncSessionResultDto<TData, TResult, TContext>> |
            undefined
    ) => void;
    private reject: (error?: any) => void;

    private pointerPosition: number = 0;
    private activePromises: number = 0;

    private promisesData: Array<PromiseDto<TData, TResult | undefined>>;
    private succeededPromiseIndexes: number[] = [];
    private failedPromiseIndexes: number[] = [];

    private isStarted: boolean = false;
    private hasFailed: boolean = false;

    /**
     * Is manager started resolving promises.
     */
    public get IsStarted(): boolean {
        return this.isStarted;
    }

    /**
     * Has manager failed to resolve promises.
     */
    public get HasFailed(): boolean {
        return this.hasFailed;
    }

    private context: TContext | undefined;

    /**
     * Sets context object, that will be available in promise function.
     */
    public set Context(contextValue: TContext | undefined) {
        this.context = contextValue;
    }

    /**
     * Retrieves context object.
     */
    public get Context(): TContext | undefined {
        return this.context;
    }

    private reset(): void {
        this.context = undefined;
        this.isStarted = false;
        this.hasFailed = false;
        this.pointerPosition = 0;
        this.activePromises = 0;
        this.failedPromiseIndexes = [];
        this.succeededPromiseIndexes = [];
        this.promisesData = [];
    }

    /**
     * Creates async function for every object supplied in promisesDate.
     */
    public async Start(promisesData: TData[], context?: TContext): Promise<AsyncSessionResultDto<TData, TResult, TContext>> {
        if (this.isStarted) {
            throw new Error(`Cannot start AsyncManager in the middle of process.`);
        }

        this.reset();
        this.context = context;
        this.isStarted = true;

        this.promisesData = promisesData.map<PromiseDto<TData, TResult | undefined>>(promiseData => ({
            Status: PromiseStatus.Init,
            Data: promiseData,
            RetriesCount: 0,
            Result: undefined
        }));

        return new Promise<AsyncSessionResultDto<TData, TResult, TContext>>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            this.activatePromises();
        });
    }

    private activatePromises(): void {
        if (this.FinishedCount === this.promisesData.length) {
            // this.promiseData[index].Result will always defined, because we know, that this index has finished.
            const results: AsyncSessionResultDto<TData, TResult, TContext> = {
                Succeeded: this.SucceededPromises,
                Failed: this.FailedPromises,
                Context: this.context
            };

            this.resolve(results);
            this.isStarted = false;
            return;
        }

        for (let i = this.activePromises; i < this.promisesConcurrently && this.pointerPosition < this.TotalCount; ++i) {
            this.activePromises++;
            this.handlePromise(this.pointerPosition);
            this.pointerPosition++;
        }
    }

    private async handlePromise(index: number): Promise<void> {
        const data = this.promisesData[index];

        try {
            const result = await this.handler(data.Data, this.context);

            // If manager failed while awaiting this promise, don't resolve it's value.
            if (this.hasFailed) {
                return;
            }

            this.promisesData[index].Result = result;
            this.promisesData[index].Status = PromiseStatus.Succeeded;
            this.succeededPromiseIndexes.push(index);

            if (this.onSinglePromiseFinished != null) {
                this.onSinglePromiseFinished(this.TotalCount, this.FinishedCount);
            }

            this.activePromises--;
            this.activatePromises();
        } catch (error) {
            // If manager failed while awaiting this promise, don't retry it.
            if (this.hasFailed) {
                return;
            }

            if (this.throwOnError) {
                this.reject(error);
                this.isStarted = false;

                // Stopping promises activation.
                this.pointerPosition = this.promisesData.length - 1;
            } else {
                // Attempting to retry failed promise.
                if (this.promisesData[index].RetriesCount < this.maxRetries) {
                    this.promisesData[index].RetriesCount++;
                    this.handlePromise(index);
                } else {
                    // Reached max retries count.
                    this.activePromises--;
                    this.promisesData[index].Status = PromiseStatus.Failed;
                    this.promisesData[index].Error = error;
                    this.failedPromiseIndexes.push(index);
                    if (this.onSinglePromiseFinished != null) {
                        this.onSinglePromiseFinished(this.TotalCount, this.FinishedCount);
                    }
                    this.activatePromises();
                }
            }
        }
    }
}
