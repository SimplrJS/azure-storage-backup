export type AsyncGenerator<T> = () => Promise<T>;

export class AsyncManager<T> {
    constructor(private asyncFunctions: Array<AsyncGenerator<T>>, private asyncFunctionsConcurrently: number = 30) { }

    private currentList: Array<Promise<T>> = [];
    private availableStack: Array<AsyncGenerator<T>> = new Array(...this.asyncFunctions);

    private resolve: () => void;
    private reject: () => void;

    public async Start(): Promise<void> {
        this.refillCurrentList();
        return new Promise<void>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    private refillCurrentList(): void {
        for (let i = this.currentList.length; i < this.asyncFunctionsConcurrently; i++) {
            const promiseGenerator = this.availableStack.pop();

            if (promiseGenerator != null) {
                this.currentList.push(new Promise(async (resolve, reject) => {
                    try {
                        const promise = promiseGenerator();
                        await promise;
                        resolve();

                        const index = this.currentList.indexOf(promise);
                        this.currentList.splice(index, 1);

                        if (this.currentList.length === 0) {
                            this.resolve();
                        } else {
                            this.refillCurrentList();
                        }
                    } catch (error) {
                        reject(error);
                    }
                }));
            }
        }
    }
}
