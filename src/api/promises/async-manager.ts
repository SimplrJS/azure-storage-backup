export type PromiseHandler<TData, TResult = void> = (data: TData) => Promise<TResult>;
export type PromiseNotifier = (total: number, finished: number) => void;

export interface PromiseDto<TData, TResult> {
    Data: TData;
    Status: PromiseStatus;
    RetriesCount: number;
    Error?: any;
    Result: TResult;
}

export interface ResultDto<TData, TResult> {
    Succeeded: Array<PromiseDto<TData, TResult>>;
    Failed: Array<PromiseDto<TData, undefined>>;
}

export enum PromiseStatus {
    Init = 0,
    Failed = 16,
    Succeeded = 32
}

export class AsyncManager<TData, TResult = void> {
    constructor(
        private handler: PromiseHandler<TData, TResult>,
        private promisesConcurrently: number = 30,
        private maxRetries: number = 3,
        private throwOnError: boolean = false
    ) { }

    public get TotalCount(): number {
        return this.promisesData.length;
    }

    public get SucceededCount(): number {
        return this.succeededPromiseIndexes.length;
    }

    public get FailedCount(): number {
        return this.failedPromiseIndexes.length;
    }

    public get FinishedCount(): number {
        return this.SucceededCount + this.FailedCount;
    }

    public get FailedPromises(): Array<PromiseDto<TData, undefined>> {
        return this.failedPromiseIndexes.map(index => this.promisesData[index]) as Array<PromiseDto<TData, undefined>>;
    }

    public get SucceededPromises(): Array<PromiseDto<TData, TResult>> {
        return this.succeededPromiseIndexes.map(index => this.promisesData[index]) as Array<PromiseDto<TData, TResult>>;
    }

    public set OnSinglePromiseFinished(notifier: PromiseNotifier) {
        this.onSinglePromiseFinished = notifier;
    }

    private onSinglePromiseFinished: PromiseNotifier | undefined;

    private resolve: (value?: ResultDto<TData, TResult> | PromiseLike<ResultDto<TData, TResult>> | undefined) => void;
    private reject: (error?: any) => void;

    private pointerPosition: number = 0;
    private activePromises: number = 0;

    private promisesData: Array<PromiseDto<TData, TResult | undefined>>;
    private succeededPromiseIndexes: number[] = [];
    private failedPromiseIndexes: number[] = [];

    private isStarted: boolean = false;
    private hasFailed: boolean = false;

    public get IsStarted(): boolean {
        return this.isStarted;
    }

    public get HasFailed(): boolean {
        return this.hasFailed;
    }

    private reset(): void {
        this.isStarted = false;
        this.hasFailed = false;
        this.pointerPosition = 0;
        this.activePromises = 0;
        this.failedPromiseIndexes = [];
        this.succeededPromiseIndexes = [];
        this.promisesData = [];
    }

    public async Start(promisesData: TData[], retriesCount = 3): Promise<ResultDto<TData, TResult>> {
        if (this.isStarted) {
            throw new Error(`Cannot start AsyncManager in the middle of process.`);
        }

        this.reset();
        this.isStarted = true;

        this.promisesData = promisesData.map<PromiseDto<TData, TResult | undefined>>(promiseData => ({
            Status: PromiseStatus.Init,
            Data: promiseData,
            RetriesCount: 0,
            Result: undefined
        }));

        this.activatePromises();

        return new Promise<ResultDto<TData, TResult>>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    private activatePromises(): void {
        if (this.FinishedCount === this.promisesData.length) {
            // this.promiseData[index].Result will always defined, because we know, that this index has finished.
            const results: ResultDto<TData, TResult> = {
                Succeeded: this.SucceededPromises,
                Failed: this.FailedPromises
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
            const result = await this.handler(data.Data);

            // If manager failed while awaiting this promise, don't resolve it's value.
            if (this.hasFailed) {
                return;
            }

            this.promisesData[index].Result = result;
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
