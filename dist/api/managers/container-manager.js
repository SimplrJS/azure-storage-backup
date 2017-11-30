"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var base_manager_1 = require("../abstractions/base-manager");
var blob_helpers_1 = require("../helpers/blob-helpers");
var ContainerManager = /** @class */ (function (_super) {
    tslib_1.__extends(ContainerManager, _super);
    function ContainerManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Retrieves next portion of container objects using current continuationToken.
     *
     * Returns next portion of container objects.
     *
     * Appends ContainerManager.Entries with fetched container objects.
     */
    ContainerManager.prototype.Next = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.getContainersList()];
            });
        });
    };
    ContainerManager.prototype.getContainersList = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var results, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.HasNext || !this.isInitialized)) return [3 /*break*/, 2];
                        this.isInitialized = true;
                        return [4 /*yield*/, blob_helpers_1.GetContainersList(this.blobService, this.continuationToken, this.options)];
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
    return ContainerManager;
}(base_manager_1.BaseManager));
exports.ContainerManager = ContainerManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL21hbmFnZXJzL2NvbnRhaW5lci1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZEQUEyRDtBQUMzRCx3REFBNEQ7QUFFNUQ7SUFBc0MsNENBQXdDO0lBQTlFOztJQXdCQSxDQUFDO0lBdEJHOzs7Ozs7T0FNRztJQUNVLCtCQUFJLEdBQWpCOzs7Z0JBQ0ksc0JBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUM7OztLQUNuQztJQUVhLDRDQUFpQixHQUEvQjs7Ozs7OzZCQUNRLENBQUEsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUEsRUFBbkMsd0JBQW1DO3dCQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzt3QkFDVixxQkFBTSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUE7O3dCQUF6RixPQUFPLEdBQUcsU0FBK0U7d0JBQy9GLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUM7d0JBQ25ELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQSxLQUFBLElBQUksQ0FBQyxPQUFPLENBQUEsQ0FBQyxNQUFNLDRCQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUMsQ0FBQzt3QkFDdkQsc0JBQU8sT0FBTyxDQUFDLE9BQU8sRUFBQzs0QkFFdkIsc0JBQU8sSUFBSSxDQUFDLE9BQU8sRUFBQzs7Ozs7S0FFM0I7SUFDTCx1QkFBQztBQUFELENBQUMsQUF4QkQsQ0FBc0MsMEJBQVcsR0F3QmhEO0FBeEJZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJsb2JTZXJ2aWNlIH0gZnJvbSBcImF6dXJlLXN0b3JhZ2VcIjtcclxuaW1wb3J0IHsgQmFzZU1hbmFnZXIgfSBmcm9tIFwiLi4vYWJzdHJhY3Rpb25zL2Jhc2UtbWFuYWdlclwiO1xyXG5pbXBvcnQgeyBHZXRDb250YWluZXJzTGlzdCB9IGZyb20gXCIuLi9oZWxwZXJzL2Jsb2ItaGVscGVyc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbnRhaW5lck1hbmFnZXIgZXh0ZW5kcyBCYXNlTWFuYWdlcjxCbG9iU2VydmljZS5Db250YWluZXJSZXN1bHQ+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBuZXh0IHBvcnRpb24gb2YgY29udGFpbmVyIG9iamVjdHMgdXNpbmcgY3VycmVudCBjb250aW51YXRpb25Ub2tlbi5cclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm5zIG5leHQgcG9ydGlvbiBvZiBjb250YWluZXIgb2JqZWN0cy5cclxuICAgICAqXHJcbiAgICAgKiBBcHBlbmRzIENvbnRhaW5lck1hbmFnZXIuRW50cmllcyB3aXRoIGZldGNoZWQgY29udGFpbmVyIG9iamVjdHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBOZXh0KCk6IFByb21pc2U8QmxvYlNlcnZpY2UuQ29udGFpbmVyUmVzdWx0W10+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb250YWluZXJzTGlzdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Q29udGFpbmVyc0xpc3QoKTogUHJvbWlzZTxCbG9iU2VydmljZS5Db250YWluZXJSZXN1bHRbXT4ge1xyXG4gICAgICAgIGlmICh0aGlzLkhhc05leHQgfHwgIXRoaXMuaXNJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgR2V0Q29udGFpbmVyc0xpc3QodGhpcy5ibG9iU2VydmljZSwgdGhpcy5jb250aW51YXRpb25Ub2tlbiwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5jb250aW51YXRpb25Ub2tlbiA9IHJlc3VsdHMuY29udGludWF0aW9uVG9rZW47XHJcbiAgICAgICAgICAgIHRoaXMuZW50cmllcyA9IHRoaXMuZW50cmllcy5jb25jYXQoLi4ucmVzdWx0cy5lbnRyaWVzKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMuZW50cmllcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbnRyaWVzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=