"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["Init"] = 0] = "Init";
    PromiseStatus[PromiseStatus["Failed"] = 16] = "Failed";
    PromiseStatus[PromiseStatus["Succeeded"] = 32] = "Succeeded";
})(PromiseStatus = exports.PromiseStatus || (exports.PromiseStatus = {}));
var AsyncManager = /** @class */ (function () {
    function AsyncManager(handler, promisesConcurrently, maxRetries, throwOnError) {
        if (promisesConcurrently === void 0) { promisesConcurrently = 30; }
        if (maxRetries === void 0) { maxRetries = 3; }
        if (throwOnError === void 0) { throwOnError = false; }
        this.handler = handler;
        this.promisesConcurrently = promisesConcurrently;
        this.maxRetries = maxRetries;
        this.throwOnError = throwOnError;
        this.pointerPosition = 0;
        this.activePromises = 0;
        this.succeededPromiseIndexes = [];
        this.failedPromiseIndexes = [];
        this.isStarted = false;
        this.hasFailed = false;
    }
    Object.defineProperty(AsyncManager.prototype, "TotalCount", {
        /**
         * Total count of objects supplied to manager.
         */
        get: function () {
            return this.promisesData.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "SucceededCount", {
        /**
         * Succeeded promises count.
         */
        get: function () {
            return this.succeededPromiseIndexes.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "FailedCount", {
        /**
         * Failed promises count.
         */
        get: function () {
            return this.failedPromiseIndexes.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "FinishedCount", {
        /**
         * Finished promises count.
         */
        get: function () {
            return this.SucceededCount + this.FailedCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "FailedPromises", {
        /**
         * Failed promises objects list.
         */
        get: function () {
            var _this = this;
            return this.failedPromiseIndexes.map(function (index) { return _this.promisesData[index]; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "SucceededPromises", {
        /**
         * Succeeded promises objects list.
         */
        get: function () {
            var _this = this;
            return this.succeededPromiseIndexes.map(function (index) { return _this.promisesData[index]; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "OnSinglePromiseFinished", {
        /**
         * Callback triggered after single promise finished.
         */
        set: function (notifier) {
            this.onSinglePromiseFinished = notifier;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "IsStarted", {
        /**
         * Is manager started resolving promises.
         */
        get: function () {
            return this.isStarted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "HasFailed", {
        /**
         * Has manager failed to resolve promises.
         */
        get: function () {
            return this.hasFailed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AsyncManager.prototype, "Context", {
        /**
         * Retrieves context object.
         */
        get: function () {
            return this.context;
        },
        /**
         * Sets context object, that will be available in promise function.
         */
        set: function (contextValue) {
            this.context = contextValue;
        },
        enumerable: true,
        configurable: true
    });
    AsyncManager.prototype.reset = function () {
        this.context = undefined;
        this.isStarted = false;
        this.hasFailed = false;
        this.pointerPosition = 0;
        this.activePromises = 0;
        this.failedPromiseIndexes = [];
        this.succeededPromiseIndexes = [];
        this.promisesData = [];
    };
    /**
     * Creates async function for every object supplied in promisesDate.
     */
    AsyncManager.prototype.Start = function (promisesData, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (this.isStarted) {
                    throw new Error("Cannot start AsyncManager in the middle of process.");
                }
                this.reset();
                this.context = context;
                this.isStarted = true;
                this.promisesData = promisesData.map(function (promiseData) { return ({
                    Status: PromiseStatus.Init,
                    Data: promiseData,
                    RetriesCount: 0,
                    Result: undefined
                }); });
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.resolve = resolve;
                        _this.reject = reject;
                        _this.activatePromises();
                    })];
            });
        });
    };
    AsyncManager.prototype.activatePromises = function () {
        if (this.FinishedCount === this.promisesData.length) {
            // this.promiseData[index].Result will always defined, because we know, that this index has finished.
            var results = {
                Succeeded: this.SucceededPromises,
                Failed: this.FailedPromises,
                Context: this.context
            };
            this.resolve(results);
            this.isStarted = false;
            return;
        }
        for (var i = this.activePromises; i < this.promisesConcurrently && this.pointerPosition < this.TotalCount; ++i) {
            this.activePromises++;
            this.handlePromise(this.pointerPosition);
            this.pointerPosition++;
        }
    };
    AsyncManager.prototype.handlePromise = function (index) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, result, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = this.promisesData[index];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.handler(data.Data, this.context)];
                    case 2:
                        result = _a.sent();
                        // If manager failed while awaiting this promise, don't resolve it's value.
                        if (this.hasFailed) {
                            return [2 /*return*/];
                        }
                        this.promisesData[index].Result = result;
                        this.promisesData[index].Status = PromiseStatus.Succeeded;
                        this.succeededPromiseIndexes.push(index);
                        if (this.onSinglePromiseFinished != null) {
                            this.onSinglePromiseFinished(this.TotalCount, this.FinishedCount);
                        }
                        this.activePromises--;
                        this.activatePromises();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        // If manager failed while awaiting this promise, don't retry it.
                        if (this.hasFailed) {
                            return [2 /*return*/];
                        }
                        if (this.throwOnError) {
                            this.reject(error_1);
                            this.isStarted = false;
                            // Stopping promises activation.
                            this.pointerPosition = this.promisesData.length - 1;
                        }
                        else {
                            // Attempting to retry failed promise.
                            if (this.promisesData[index].RetriesCount < this.maxRetries) {
                                this.promisesData[index].RetriesCount++;
                                this.handlePromise(index);
                            }
                            else {
                                // Reached max retries count.
                                this.activePromises--;
                                this.promisesData[index].Status = PromiseStatus.Failed;
                                this.promisesData[index].Error = error_1;
                                this.failedPromiseIndexes.push(index);
                                if (this.onSinglePromiseFinished != null) {
                                    this.onSinglePromiseFinished(this.TotalCount, this.FinishedCount);
                                }
                                this.activatePromises();
                            }
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AsyncManager;
}());
exports.AsyncManager = AsyncManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMtbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvcHJvbWlzZXMvYXN5bmMtbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFpQkEsSUFBWSxhQUlYO0FBSkQsV0FBWSxhQUFhO0lBQ3JCLGlEQUFRLENBQUE7SUFDUixzREFBVyxDQUFBO0lBQ1gsNERBQWMsQ0FBQTtBQUNsQixDQUFDLEVBSlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFJeEI7QUFFRDtJQUNJLHNCQUNZLE9BQTZELEVBQzdELG9CQUFpQyxFQUNqQyxVQUFzQixFQUN0QixZQUE2QjtRQUY3QixxQ0FBQSxFQUFBLHlCQUFpQztRQUNqQywyQkFBQSxFQUFBLGNBQXNCO1FBQ3RCLDZCQUFBLEVBQUEsb0JBQTZCO1FBSDdCLFlBQU8sR0FBUCxPQUFPLENBQXNEO1FBQzdELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBYTtRQUNqQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGlCQUFZLEdBQVosWUFBWSxDQUFpQjtRQTZEakMsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFDNUIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFHM0IsNEJBQXVCLEdBQWEsRUFBRSxDQUFDO1FBQ3ZDLHlCQUFvQixHQUFhLEVBQUUsQ0FBQztRQUVwQyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLGNBQVMsR0FBWSxLQUFLLENBQUM7SUFwRS9CLENBQUM7SUFLTCxzQkFBVyxvQ0FBVTtRQUhyQjs7V0FFRzthQUNIO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ3BDLENBQUM7OztPQUFBO0lBS0Qsc0JBQVcsd0NBQWM7UUFIekI7O1dBRUc7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDO1FBQy9DLENBQUM7OztPQUFBO0lBS0Qsc0JBQVcscUNBQVc7UUFI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QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixzQ0FBc0M7NEJBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dDQUMxRCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUM5QixDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNKLDZCQUE2QjtnQ0FDN0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dDQUN0QixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO2dDQUN2RCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxPQUFLLENBQUM7Z0NBQ3ZDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0NBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29DQUN2QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0NBQ3RFLENBQUM7Z0NBQ0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7NEJBQzVCLENBQUM7d0JBQ0wsQ0FBQzs7Ozs7O0tBRVI7SUFDTCxtQkFBQztBQUFELENBQUMsQUF6TkQsSUF5TkM7QUF6Tlksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSBQcm9taXNlSGFuZGxlcjxURGF0YSwgVFJlc3VsdCA9IHZvaWQsIFRDb250ZXh0ID0gdm9pZD4gPSAoZGF0YTogVERhdGEsIGNvbnRleHQ6IFRDb250ZXh0KSA9PiBQcm9taXNlPFRSZXN1bHQ+O1xyXG5leHBvcnQgdHlwZSBQcm9taXNlTm90aWZpZXIgPSAodG90YWw6IG51bWJlciwgZmluaXNoZWQ6IG51bWJlcikgPT4gdm9pZDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUHJvbWlzZUR0bzxURGF0YSwgVFJlc3VsdD4ge1xyXG4gICAgRGF0YTogVERhdGE7XHJcbiAgICBTdGF0dXM6IFByb21pc2VTdGF0dXM7XHJcbiAgICBSZXRyaWVzQ291bnQ6IG51bWJlcjtcclxuICAgIEVycm9yPzogYW55O1xyXG4gICAgUmVzdWx0OiBUUmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jU2Vzc2lvblJlc3VsdER0bzxURGF0YSwgVFJlc3VsdCwgVENvbnRleHQgPSB2b2lkPiB7XHJcbiAgICBTdWNjZWVkZWQ6IEFycmF5PFByb21pc2VEdG88VERhdGEsIFRSZXN1bHQ+PjtcclxuICAgIEZhaWxlZDogQXJyYXk8UHJvbWlzZUR0bzxURGF0YSwgdW5kZWZpbmVkPj47XHJcbiAgICBDb250ZXh0PzogVENvbnRleHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFByb21pc2VTdGF0dXMge1xyXG4gICAgSW5pdCA9IDAsXHJcbiAgICBGYWlsZWQgPSAxNixcclxuICAgIFN1Y2NlZWRlZCA9IDMyXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBc3luY01hbmFnZXI8VERhdGEsIFRSZXN1bHQgPSB2b2lkLCBUQ29udGV4dCA9IHZvaWQ+IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgaGFuZGxlcjogUHJvbWlzZUhhbmRsZXI8VERhdGEsIFRSZXN1bHQsIFRDb250ZXh0IHwgdW5kZWZpbmVkPixcclxuICAgICAgICBwcml2YXRlIHByb21pc2VzQ29uY3VycmVudGx5OiBudW1iZXIgPSAzMCxcclxuICAgICAgICBwcml2YXRlIG1heFJldHJpZXM6IG51bWJlciA9IDMsXHJcbiAgICAgICAgcHJpdmF0ZSB0aHJvd09uRXJyb3I6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICAgKSB7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvdGFsIGNvdW50IG9mIG9iamVjdHMgc3VwcGxpZWQgdG8gbWFuYWdlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBUb3RhbENvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZXNEYXRhLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1Y2NlZWRlZCBwcm9taXNlcyBjb3VudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBTdWNjZWVkZWRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN1Y2NlZWRlZFByb21pc2VJbmRleGVzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZhaWxlZCBwcm9taXNlcyBjb3VudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBGYWlsZWRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZhaWxlZFByb21pc2VJbmRleGVzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmlzaGVkIHByb21pc2VzIGNvdW50LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IEZpbmlzaGVkQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5TdWNjZWVkZWRDb3VudCArIHRoaXMuRmFpbGVkQ291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGYWlsZWQgcHJvbWlzZXMgb2JqZWN0cyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IEZhaWxlZFByb21pc2VzKCk6IEFycmF5PFByb21pc2VEdG88VERhdGEsIHVuZGVmaW5lZD4+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mYWlsZWRQcm9taXNlSW5kZXhlcy5tYXAoaW5kZXggPT4gdGhpcy5wcm9taXNlc0RhdGFbaW5kZXhdKSBhcyBBcnJheTxQcm9taXNlRHRvPFREYXRhLCB1bmRlZmluZWQ+PjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1Y2NlZWRlZCBwcm9taXNlcyBvYmplY3RzIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgU3VjY2VlZGVkUHJvbWlzZXMoKTogQXJyYXk8UHJvbWlzZUR0bzxURGF0YSwgVFJlc3VsdD4+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdWNjZWVkZWRQcm9taXNlSW5kZXhlcy5tYXAoaW5kZXggPT4gdGhpcy5wcm9taXNlc0RhdGFbaW5kZXhdKSBhcyBBcnJheTxQcm9taXNlRHRvPFREYXRhLCBUUmVzdWx0Pj47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsYmFjayB0cmlnZ2VyZWQgYWZ0ZXIgc2luZ2xlIHByb21pc2UgZmluaXNoZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgT25TaW5nbGVQcm9taXNlRmluaXNoZWQobm90aWZpZXI6IFByb21pc2VOb3RpZmllcikge1xyXG4gICAgICAgIHRoaXMub25TaW5nbGVQcm9taXNlRmluaXNoZWQgPSBub3RpZmllcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU2luZ2xlUHJvbWlzZUZpbmlzaGVkOiBQcm9taXNlTm90aWZpZXIgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgcHJpdmF0ZSByZXNvbHZlOiAoXHJcbiAgICAgICAgdmFsdWU/OiBBc3luY1Nlc3Npb25SZXN1bHREdG88VERhdGEsIFRSZXN1bHQsIFRDb250ZXh0PiB8XHJcbiAgICAgICAgICAgIFByb21pc2VMaWtlPEFzeW5jU2Vzc2lvblJlc3VsdER0bzxURGF0YSwgVFJlc3VsdCwgVENvbnRleHQ+PiB8XHJcbiAgICAgICAgICAgIHVuZGVmaW5lZFxyXG4gICAgKSA9PiB2b2lkO1xyXG4gICAgcHJpdmF0ZSByZWplY3Q6IChlcnJvcj86IGFueSkgPT4gdm9pZDtcclxuXHJcbiAgICBwcml2YXRlIHBvaW50ZXJQb3NpdGlvbjogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgYWN0aXZlUHJvbWlzZXM6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBwcm9taXNlc0RhdGE6IEFycmF5PFByb21pc2VEdG88VERhdGEsIFRSZXN1bHQgfCB1bmRlZmluZWQ+PjtcclxuICAgIHByaXZhdGUgc3VjY2VlZGVkUHJvbWlzZUluZGV4ZXM6IG51bWJlcltdID0gW107XHJcbiAgICBwcml2YXRlIGZhaWxlZFByb21pc2VJbmRleGVzOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgaXNTdGFydGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGhhc0ZhaWxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSXMgbWFuYWdlciBzdGFydGVkIHJlc29sdmluZyBwcm9taXNlcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBJc1N0YXJ0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNTdGFydGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFzIG1hbmFnZXIgZmFpbGVkIHRvIHJlc29sdmUgcHJvbWlzZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgSGFzRmFpbGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhhc0ZhaWxlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbnRleHQ6IFRDb250ZXh0IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBjb250ZXh0IG9iamVjdCwgdGhhdCB3aWxsIGJlIGF2YWlsYWJsZSBpbiBwcm9taXNlIGZ1bmN0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0IENvbnRleHQoY29udGV4dFZhbHVlOiBUQ29udGV4dCB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBjb250ZXh0IG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBDb250ZXh0KCk6IFRDb250ZXh0IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuaXNTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oYXNGYWlsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnBvaW50ZXJQb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQcm9taXNlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5mYWlsZWRQcm9taXNlSW5kZXhlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3VjY2VlZGVkUHJvbWlzZUluZGV4ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnByb21pc2VzRGF0YSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhc3luYyBmdW5jdGlvbiBmb3IgZXZlcnkgb2JqZWN0IHN1cHBsaWVkIGluIHByb21pc2VzRGF0ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIFN0YXJ0KHByb21pc2VzRGF0YTogVERhdGFbXSwgY29udGV4dD86IFRDb250ZXh0KTogUHJvbWlzZTxBc3luY1Nlc3Npb25SZXN1bHREdG88VERhdGEsIFRSZXN1bHQsIFRDb250ZXh0Pj4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzU3RhcnRlZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzdGFydCBBc3luY01hbmFnZXIgaW4gdGhlIG1pZGRsZSBvZiBwcm9jZXNzLmApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5pc1N0YXJ0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnByb21pc2VzRGF0YSA9IHByb21pc2VzRGF0YS5tYXA8UHJvbWlzZUR0bzxURGF0YSwgVFJlc3VsdCB8IHVuZGVmaW5lZD4+KHByb21pc2VEYXRhID0+ICh7XHJcbiAgICAgICAgICAgIFN0YXR1czogUHJvbWlzZVN0YXR1cy5Jbml0LFxyXG4gICAgICAgICAgICBEYXRhOiBwcm9taXNlRGF0YSxcclxuICAgICAgICAgICAgUmV0cmllc0NvdW50OiAwLFxyXG4gICAgICAgICAgICBSZXN1bHQ6IHVuZGVmaW5lZFxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEFzeW5jU2Vzc2lvblJlc3VsdER0bzxURGF0YSwgVFJlc3VsdCwgVENvbnRleHQ+PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XHJcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZVByb21pc2VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhY3RpdmF0ZVByb21pc2VzKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLkZpbmlzaGVkQ291bnQgPT09IHRoaXMucHJvbWlzZXNEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAvLyB0aGlzLnByb21pc2VEYXRhW2luZGV4XS5SZXN1bHQgd2lsbCBhbHdheXMgZGVmaW5lZCwgYmVjYXVzZSB3ZSBrbm93LCB0aGF0IHRoaXMgaW5kZXggaGFzIGZpbmlzaGVkLlxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzOiBBc3luY1Nlc3Npb25SZXN1bHREdG88VERhdGEsIFRSZXN1bHQsIFRDb250ZXh0PiA9IHtcclxuICAgICAgICAgICAgICAgIFN1Y2NlZWRlZDogdGhpcy5TdWNjZWVkZWRQcm9taXNlcyxcclxuICAgICAgICAgICAgICAgIEZhaWxlZDogdGhpcy5GYWlsZWRQcm9taXNlcyxcclxuICAgICAgICAgICAgICAgIENvbnRleHQ6IHRoaXMuY29udGV4dFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5hY3RpdmVQcm9taXNlczsgaSA8IHRoaXMucHJvbWlzZXNDb25jdXJyZW50bHkgJiYgdGhpcy5wb2ludGVyUG9zaXRpb24gPCB0aGlzLlRvdGFsQ291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVByb21pc2VzKys7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUHJvbWlzZSh0aGlzLnBvaW50ZXJQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlclBvc2l0aW9uKys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlUHJvbWlzZShpbmRleDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMucHJvbWlzZXNEYXRhW2luZGV4XTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5oYW5kbGVyKGRhdGEuRGF0YSwgdGhpcy5jb250ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIG1hbmFnZXIgZmFpbGVkIHdoaWxlIGF3YWl0aW5nIHRoaXMgcHJvbWlzZSwgZG9uJ3QgcmVzb2x2ZSBpdCdzIHZhbHVlLlxyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNGYWlsZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcm9taXNlc0RhdGFbaW5kZXhdLlJlc3VsdCA9IHJlc3VsdDtcclxuICAgICAgICAgICAgdGhpcy5wcm9taXNlc0RhdGFbaW5kZXhdLlN0YXR1cyA9IFByb21pc2VTdGF0dXMuU3VjY2VlZGVkO1xyXG4gICAgICAgICAgICB0aGlzLnN1Y2NlZWRlZFByb21pc2VJbmRleGVzLnB1c2goaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub25TaW5nbGVQcm9taXNlRmluaXNoZWQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblNpbmdsZVByb21pc2VGaW5pc2hlZCh0aGlzLlRvdGFsQ291bnQsIHRoaXMuRmluaXNoZWRDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlUHJvbWlzZXMtLTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZVByb21pc2VzKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgLy8gSWYgbWFuYWdlciBmYWlsZWQgd2hpbGUgYXdhaXRpbmcgdGhpcyBwcm9taXNlLCBkb24ndCByZXRyeSBpdC5cclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRmFpbGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRocm93T25FcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1N0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdG9wcGluZyBwcm9taXNlcyBhY3RpdmF0aW9uLlxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludGVyUG9zaXRpb24gPSB0aGlzLnByb21pc2VzRGF0YS5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gQXR0ZW1wdGluZyB0byByZXRyeSBmYWlsZWQgcHJvbWlzZS5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb21pc2VzRGF0YVtpbmRleF0uUmV0cmllc0NvdW50IDwgdGhpcy5tYXhSZXRyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9taXNlc0RhdGFbaW5kZXhdLlJldHJpZXNDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlUHJvbWlzZShpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlYWNoZWQgbWF4IHJldHJpZXMgY291bnQuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVQcm9taXNlcy0tO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvbWlzZXNEYXRhW2luZGV4XS5TdGF0dXMgPSBQcm9taXNlU3RhdHVzLkZhaWxlZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb21pc2VzRGF0YVtpbmRleF0uRXJyb3IgPSBlcnJvcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZhaWxlZFByb21pc2VJbmRleGVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uU2luZ2xlUHJvbWlzZUZpbmlzaGVkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNpbmdsZVByb21pc2VGaW5pc2hlZCh0aGlzLlRvdGFsQ291bnQsIHRoaXMuRmluaXNoZWRDb3VudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVQcm9taXNlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==