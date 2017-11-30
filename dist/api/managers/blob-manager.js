"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var blob_helpers_1 = require("../helpers/blob-helpers");
var base_manager_1 = require("../abstractions/base-manager");
var BlobManager = /** @class */ (function (_super) {
    tslib_1.__extends(BlobManager, _super);
    function BlobManager(blobService, containerName, options) {
        var _this = _super.call(this, blobService, options) || this;
        _this.blobService = blobService;
        _this.containerName = containerName;
        _this.options = options;
        return _this;
    }
    /**
     * Retrieves next portion of blobs using current continuationToken.
     *
     * Returns next portion of blobs.
     *
     * Appends BlobManager.Entries with fetched blobs.
     */
    BlobManager.prototype.Next = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.getBlobsList()];
            });
        });
    };
    Object.defineProperty(BlobManager.prototype, "ContainerName", {
        /**
         * Retrieves container name of blobs that are fetched.
         */
        get: function () {
            return this.containerName;
        },
        enumerable: true,
        configurable: true
    });
    BlobManager.prototype.getBlobsList = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var results, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.HasNext || !this.isInitialized)) return [3 /*break*/, 2];
                        this.isInitialized = true;
                        return [4 /*yield*/, blob_helpers_1.GetBlobsList(this.blobService, this.containerName, this.continuationToken, this.options)];
                    case 1:
                        results = _b.sent();
                        this.continuationToken = results.continuationToken;
                        this.entries = (_a = this.entries).concat.apply(_a, tslib_1.__spread(results.entries));
                        return [2 /*return*/, results.entries];
                    case 2: return [2 /*return*/, this.entries];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return BlobManager;
}(base_manager_1.BaseManager));
exports.BlobManager = BlobManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvYi1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9tYW5hZ2Vycy9ibG9iLW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0RBQXVEO0FBQ3ZELDZEQUEyRDtBQUUzRDtJQUFpQyx1Q0FBbUM7SUFDaEUscUJBQ2MsV0FBd0IsRUFDeEIsYUFBcUIsRUFDckIsT0FBMEM7UUFIeEQsWUFLSSxrQkFBTSxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQzlCO1FBTGEsaUJBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsbUJBQWEsR0FBYixhQUFhLENBQVE7UUFDckIsYUFBTyxHQUFQLE9BQU8sQ0FBbUM7O0lBR3hELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDVSwwQkFBSSxHQUFqQjs7O2dCQUNJLHNCQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQzs7O0tBQzlCO0lBS0Qsc0JBQVcsc0NBQWE7UUFIeEI7O1dBRUc7YUFDSDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzlCLENBQUM7OztPQUFBO0lBRWEsa0NBQVksR0FBMUI7Ozs7Ozs2QkFDUSxDQUFBLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFBLEVBQW5DLHdCQUFtQzt3QkFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7d0JBQ1YscUJBQU0sMkJBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQTs7d0JBQXhHLE9BQU8sR0FBRyxTQUE4Rjt3QkFDOUcsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFBLEtBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQSxDQUFDLE1BQU0sNEJBQUksT0FBTyxDQUFDLE9BQU8sRUFBQyxDQUFDO3dCQUN2RCxzQkFBTyxPQUFPLENBQUMsT0FBTyxFQUFDOzRCQUV2QixzQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFDOzs7OztLQUUzQjtJQUNMLGtCQUFDO0FBQUQsQ0FBQyxBQXRDRCxDQUFpQywwQkFBVyxHQXNDM0M7QUF0Q1ksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCbG9iU2VydmljZSB9IGZyb20gXCJhenVyZS1zdG9yYWdlXCI7XHJcbmltcG9ydCB7IEdldEJsb2JzTGlzdCB9IGZyb20gXCIuLi9oZWxwZXJzL2Jsb2ItaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBCYXNlTWFuYWdlciB9IGZyb20gXCIuLi9hYnN0cmFjdGlvbnMvYmFzZS1tYW5hZ2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQmxvYk1hbmFnZXIgZXh0ZW5kcyBCYXNlTWFuYWdlcjxCbG9iU2VydmljZS5CbG9iUmVzdWx0PiB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcm90ZWN0ZWQgYmxvYlNlcnZpY2U6IEJsb2JTZXJ2aWNlLFxyXG4gICAgICAgIHByb3RlY3RlZCBjb250YWluZXJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcHJvdGVjdGVkIG9wdGlvbnM/OiBCbG9iU2VydmljZS5MaXN0Q29udGFpbmVyT3B0aW9uc1xyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIoYmxvYlNlcnZpY2UsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIG5leHQgcG9ydGlvbiBvZiBibG9icyB1c2luZyBjdXJyZW50IGNvbnRpbnVhdGlvblRva2VuLlxyXG4gICAgICpcclxuICAgICAqIFJldHVybnMgbmV4dCBwb3J0aW9uIG9mIGJsb2JzLlxyXG4gICAgICpcclxuICAgICAqIEFwcGVuZHMgQmxvYk1hbmFnZXIuRW50cmllcyB3aXRoIGZldGNoZWQgYmxvYnMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBOZXh0KCk6IFByb21pc2U8QmxvYlNlcnZpY2UuQmxvYlJlc3VsdFtdPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QmxvYnNMaXN0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZXMgY29udGFpbmVyIG5hbWUgb2YgYmxvYnMgdGhhdCBhcmUgZmV0Y2hlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBDb250YWluZXJOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGdldEJsb2JzTGlzdCgpOiBQcm9taXNlPEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHRbXT4ge1xyXG4gICAgICAgIGlmICh0aGlzLkhhc05leHQgfHwgIXRoaXMuaXNJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgR2V0QmxvYnNMaXN0KHRoaXMuYmxvYlNlcnZpY2UsIHRoaXMuY29udGFpbmVyTmFtZSwgdGhpcy5jb250aW51YXRpb25Ub2tlbiwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5jb250aW51YXRpb25Ub2tlbiA9IHJlc3VsdHMuY29udGludWF0aW9uVG9rZW47XHJcbiAgICAgICAgICAgIHRoaXMuZW50cmllcyA9IHRoaXMuZW50cmllcy5jb25jYXQoLi4ucmVzdWx0cy5lbnRyaWVzKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMuZW50cmllcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbnRyaWVzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=