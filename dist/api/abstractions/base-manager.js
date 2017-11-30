"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Base manager to fetch and store Azure data with continuation token.
 */
var BaseManager = /** @class */ (function () {
    function BaseManager(blobService, options) {
        this.blobService = blobService;
        this.options = options;
        /**
         * Entries fetched from Azure Storage account.
         */
        this.entries = [];
        /**
         * Defines if data fetching started.
         */
        this.isInitialized = false;
    }
    Object.defineProperty(BaseManager.prototype, "HasNext", {
        /**
         * Defines if there are more data to fetch.
         */
        get: function () {
            return Boolean(this.continuationToken);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clears all data fetched by manager.
     */
    BaseManager.prototype.Clear = function () {
        this.continuationToken = undefined;
        this.entries = [];
        this.isInitialized = false;
    };
    Object.defineProperty(BaseManager.prototype, "Entries", {
        /**
         * Retrieves all entries fetched by now.
         */
        get: function () {
            return this.entries;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseManager.prototype, "Count", {
        /**
         * Retrieves count of all entries fetched by now.
         */
        get: function () {
            return this.entries.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseManager.prototype, "ContinuationToken", {
        /**
         * Retrieves continuation token.
         */
        get: function () {
            return this.continuationToken;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseManager.prototype, "IsFinished", {
        /**
         * Defines if all the values have been fetched.
         */
        get: function () {
            return !this.HasNext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseManager.prototype, "IsInitialized", {
        /**
         * Defines if data fetching has started.
         */
        get: function () {
            return this.isInitialized;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Fetches all data using Next().
     */
    BaseManager.prototype.FetchAll = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.IsInitialized || this.HasNext)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.Next()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/, this.entries];
                }
            });
        });
    };
    return BaseManager;
}());
exports.BaseManager = BaseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9hYnN0cmFjdGlvbnMvYmFzZS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOztHQUVHO0FBQ0g7SUFDSSxxQkFDYyxXQUF3QixFQUN4QixPQUEwQztRQUQxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixZQUFPLEdBQVAsT0FBTyxDQUFtQztRQUt4RDs7V0FFRztRQUNPLFlBQU8sR0FBZ0IsRUFBRSxDQUFDO1FBRXBDOztXQUVHO1FBQ08sa0JBQWEsR0FBWSxLQUFLLENBQUM7SUFackMsQ0FBQztJQWlCTCxzQkFBVyxnQ0FBTztRQUhsQjs7V0FFRzthQUNIO1lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMzQyxDQUFDOzs7T0FBQTtJQUVEOztPQUVHO0lBQ0ksMkJBQUssR0FBWjtRQUNJLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQVVELHNCQUFXLGdDQUFPO1FBSGxCOztXQUVHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUtELHNCQUFXLDhCQUFLO1FBSGhCOztXQUVHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQzs7O09BQUE7SUFLRCxzQkFBVywwQ0FBaUI7UUFINUI7O1dBRUc7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDbEMsQ0FBQzs7O09BQUE7SUFLRCxzQkFBVyxtQ0FBVTtRQUhyQjs7V0FFRzthQUNIO1lBQ0ksTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQUtELHNCQUFXLHNDQUFhO1FBSHhCOztXQUVHO2FBQ0g7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQUVEOztPQUVHO0lBQ1UsOEJBQVEsR0FBckI7Ozs7OzZCQUNXLENBQUEsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUE7d0JBQ3RDLHFCQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBQTs7d0JBQWpCLFNBQWlCLENBQUM7OzRCQUd0QixzQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFDOzs7O0tBQ3ZCO0lBQ0wsa0JBQUM7QUFBRCxDQUFDLEFBcEZELElBb0ZDO0FBcEZxQixrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJsb2JTZXJ2aWNlLCBjb21tb24gfSBmcm9tIFwiYXp1cmUtc3RvcmFnZVwiO1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgbWFuYWdlciB0byBmZXRjaCBhbmQgc3RvcmUgQXp1cmUgZGF0YSB3aXRoIGNvbnRpbnVhdGlvbiB0b2tlbi5cclxuICovXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlTWFuYWdlcjxUSXRlbVR5cGU+IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByb3RlY3RlZCBibG9iU2VydmljZTogQmxvYlNlcnZpY2UsXHJcbiAgICAgICAgcHJvdGVjdGVkIG9wdGlvbnM/OiBCbG9iU2VydmljZS5MaXN0Q29udGFpbmVyT3B0aW9uc1xyXG4gICAgKSB7IH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY29udGludWF0aW9uVG9rZW46IGNvbW1vbi5Db250aW51YXRpb25Ub2tlbiB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVudHJpZXMgZmV0Y2hlZCBmcm9tIEF6dXJlIFN0b3JhZ2UgYWNjb3VudC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGVudHJpZXM6IFRJdGVtVHlwZVtdID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGlmIGRhdGEgZmV0Y2hpbmcgc3RhcnRlZC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGlzSW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWYgdGhlcmUgYXJlIG1vcmUgZGF0YSB0byBmZXRjaC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBIYXNOZXh0KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuY29udGludWF0aW9uVG9rZW4pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIGFsbCBkYXRhIGZldGNoZWQgYnkgbWFuYWdlci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIENsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY29udGludWF0aW9uVG9rZW4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzID0gW107XHJcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydHMgZmV0Y2hpbmcgbmV4dCBwb3J0aW9uIG9mIGRhdGEuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhYnN0cmFjdCBhc3luYyBOZXh0KCk6IFByb21pc2U8VEl0ZW1UeXBlW10+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGFsbCBlbnRyaWVzIGZldGNoZWQgYnkgbm93LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IEVudHJpZXMoKTogVEl0ZW1UeXBlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZXMgY291bnQgb2YgYWxsIGVudHJpZXMgZmV0Y2hlZCBieSBub3cuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbnRyaWVzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBjb250aW51YXRpb24gdG9rZW4uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgQ29udGludWF0aW9uVG9rZW4oKTogY29tbW9uLkNvbnRpbnVhdGlvblRva2VuIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb250aW51YXRpb25Ub2tlbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWYgYWxsIHRoZSB2YWx1ZXMgaGF2ZSBiZWVuIGZldGNoZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgSXNGaW5pc2hlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuSGFzTmV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWYgZGF0YSBmZXRjaGluZyBoYXMgc3RhcnRlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBJc0luaXRpYWxpemVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzSW5pdGlhbGl6ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGZXRjaGVzIGFsbCBkYXRhIHVzaW5nIE5leHQoKS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIEZldGNoQWxsKCk6IFByb21pc2U8VEl0ZW1UeXBlW10+IHtcclxuICAgICAgICB3aGlsZSAoIXRoaXMuSXNJbml0aWFsaXplZCB8fCB0aGlzLkhhc05leHQpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5OZXh0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lbnRyaWVzO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==