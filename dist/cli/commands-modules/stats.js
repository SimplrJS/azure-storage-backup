"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Table = require("cli-table2");
var os_1 = require("os");
var cli_helpers_1 = require("../cli-helpers");
var cli_logger_1 = require("../logger/cli-logger");
var storage_account_manager_1 = require("../../api/managers/storage-account/storage-account-manager");
/**
 * CLI command `stats` class.
 *
 * Provides a statistics about blobs in Azure Storage account containers.
 */
var StatisticsCommandClass = /** @class */ (function () {
    function StatisticsCommandClass() {
        var _this = this;
        this.command = "stats";
        this.describe = "Retrieves statistics of a Storage account or a container.";
        this.builder = {
            showInBytes: {
                default: false,
                type: "boolean"
            }
        };
        this.handler = function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var configPath, config, storageAccountManager, containerBlobs, table, row, containersBlobs, successfullyFetchedListTitle, successOutputString, failureTitle, failureOutputString, error_1, configError_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        configPath = cli_helpers_1.ResolveConfigPath(options.config);
                        cli_logger_1.CLILogger.Info("Reading config from \"" + configPath + "\".");
                        config = cli_helpers_1.ReadConfig(configPath);
                        cli_logger_1.AddFileMessageHandler(config.logPath, config.noLogFile);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        storageAccountManager = new storage_account_manager_1.StorageAccountManager(config, cli_logger_1.CLILogger, options.noCache);
                        return [4 /*yield*/, storageAccountManager.CheckServiceStatus()];
                    case 2:
                        _a.sent();
                        if (!cli_helpers_1.IsContainerNameValid(options.container)) return [3 /*break*/, 4];
                        return [4 /*yield*/, storageAccountManager.FetchContainerBlobsList(options.container)];
                    case 3:
                        containerBlobs = _a.sent();
                        table = new Table(cli_helpers_1.BlobsListTableConfig);
                        row = cli_helpers_1.ConstructStatisticsTableRow(options.container, containerBlobs, options.showInBytes, cli_helpers_1.DefaultBlobResultGetter);
                        table.push(row);
                        cli_logger_1.CLILogger.Info(os_1.EOL + table.toString());
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, storageAccountManager.FetchContainersBlobsList()];
                    case 5:
                        containersBlobs = _a.sent();
                        successfullyFetchedListTitle = "Successfully fetched blobs lists (" + containersBlobs.Succeeded.length + "):";
                        successOutputString = this.resolveSucceededBlobsListsTableString(successfullyFetchedListTitle, containersBlobs.Succeeded, options.showInBytes);
                        cli_logger_1.CLILogger.Info(successOutputString);
                        if (containersBlobs.Failed.length > 0) {
                            failureTitle = "Failed to fetch " + containersBlobs.Failed.length + " blobs lists:";
                            failureOutputString = this.resolveFailedBlobsListsTableString(failureTitle, containersBlobs.Failed, options.showInBytes);
                            cli_logger_1.CLILogger.Info(failureOutputString);
                        }
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        cli_logger_1.CLILogger.Critical("Failed to get statistics of a storage account.", os_1.EOL, error_1);
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        configError_1 = _a.sent();
                        console.error(configError_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    }
    StatisticsCommandClass.prototype.resolveFailedBlobsListsTableString = function (title, failuresList, showInBytes) {
        if (showInBytes === void 0) { showInBytes = false; }
        var finalString = title + os_1.EOL;
        try {
            for (var failuresList_1 = tslib_1.__values(failuresList), failuresList_1_1 = failuresList_1.next(); !failuresList_1_1.done; failuresList_1_1 = failuresList_1.next()) {
                var blobsResultList = failuresList_1_1.value;
                finalString += blobsResultList.Data.name + ":" + os_1.EOL + "*     " + blobsResultList.Error;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (failuresList_1_1 && !failuresList_1_1.done && (_a = failuresList_1.return)) _a.call(failuresList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return finalString;
        var e_1, _a;
    };
    StatisticsCommandClass.prototype.resolveSucceededBlobsListsTableString = function (title, containersBlobsList, showInBytes) {
        if (showInBytes === void 0) { showInBytes = false; }
        var table = new Table(cli_helpers_1.BlobsListTableConfig);
        try {
            for (var containersBlobsList_1 = tslib_1.__values(containersBlobsList), containersBlobsList_1_1 = containersBlobsList_1.next(); !containersBlobsList_1_1.done; containersBlobsList_1_1 = containersBlobsList_1.next()) {
                var blobsResultsList = containersBlobsList_1_1.value;
                var row = cli_helpers_1.ConstructStatisticsTableRow(blobsResultsList.Data.name, blobsResultsList.Result, showInBytes, cli_helpers_1.DefaultBlobResultGetter);
                table.push(row);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (containersBlobsList_1_1 && !containersBlobsList_1_1.done && (_a = containersBlobsList_1.return)) _a.call(containersBlobsList_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return title + os_1.EOL + table.toString();
        var e_2, _a;
    };
    return StatisticsCommandClass;
}());
exports.StatisticsCommandClass = StatisticsCommandClass;
exports.StatisticsCommand = new StatisticsCommandClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbW1hbmRzLW1vZHVsZXMvc3RhdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0NBQW9DO0FBRXBDLHlCQUF5QjtBQUl6Qiw4Q0FPd0I7QUFDeEIsbURBQXdFO0FBQ3hFLHNHQUFtRztBQU1uRzs7OztHQUlHO0FBQ0g7SUFBQTtRQUFBLGlCQWtHQztRQWpHVSxZQUFPLEdBQVcsT0FBTyxDQUFDO1FBRTFCLGFBQVEsR0FBVywyREFBMkQsQ0FBQztRQUUvRSxZQUFPLEdBQW1CO1lBQzdCLFdBQVcsRUFBRTtnQkFDVCxPQUFPLEVBQUUsS0FBSztnQkFDZCxJQUFJLEVBQUUsU0FBUzthQUNsQjtTQUNKLENBQUM7UUFFSyxZQUFPLEdBQUcsVUFBTyxPQUFpQzs7Ozs7O3dCQUUzQyxVQUFVLEdBQUcsK0JBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUVyRCxzQkFBUyxDQUFDLElBQUksQ0FBQywyQkFBd0IsVUFBVSxRQUFJLENBQUMsQ0FBQzt3QkFDakQsTUFBTSxHQUFHLHdCQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBRXRDLGtDQUFxQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzs7O3dCQUc5QyxxQkFBcUIsR0FBRyxJQUFJLCtDQUFxQixDQUFDLE1BQU0sRUFBRSxzQkFBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDNUYscUJBQU0scUJBQXFCLENBQUMsa0JBQWtCLEVBQUUsRUFBQTs7d0JBQWhELFNBQWdELENBQUM7NkJBRTdDLGtDQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBdkMsd0JBQXVDO3dCQUNoQixxQkFBTSxxQkFBcUIsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUE7O3dCQUF2RixjQUFjLEdBQUcs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LFFBQUEsaUJBQWlCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRhYmxlIGZyb20gXCJjbGktdGFibGUyXCI7XHJcbmltcG9ydCB7IENvbW1hbmRNb2R1bGUsIENvbW1hbmRCdWlsZGVyIH0gZnJvbSBcInlhcmdzXCI7XHJcbmltcG9ydCB7IEVPTCB9IGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgeyBCbG9iU2VydmljZSB9IGZyb20gXCJhenVyZS1zdG9yYWdlXCI7XHJcblxyXG5pbXBvcnQgeyBDTElBcmd1bWVudHNPYmplY3QgfSBmcm9tIFwiLi4vY2xpLWNvbnRyYWN0c1wiO1xyXG5pbXBvcnQge1xyXG4gICAgUmVhZENvbmZpZyxcclxuICAgIFJlc29sdmVDb25maWdQYXRoLFxyXG4gICAgSXNDb250YWluZXJOYW1lVmFsaWQsXHJcbiAgICBCbG9ic0xpc3RUYWJsZUNvbmZpZyxcclxuICAgIENvbnN0cnVjdFN0YXRpc3RpY3NUYWJsZVJvdyxcclxuICAgIERlZmF1bHRCbG9iUmVzdWx0R2V0dGVyXHJcbn0gZnJvbSBcIi4uL2NsaS1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IENMSUxvZ2dlciwgQWRkRmlsZU1lc3NhZ2VIYW5kbGVyIH0gZnJvbSBcIi4uL2xvZ2dlci9jbGktbG9nZ2VyXCI7XHJcbmltcG9ydCB7IFN0b3JhZ2VBY2NvdW50TWFuYWdlciB9IGZyb20gXCIuLi8uLi9hcGkvbWFuYWdlcnMvc3RvcmFnZS1hY2NvdW50L3N0b3JhZ2UtYWNjb3VudC1tYW5hZ2VyXCI7XHJcbmltcG9ydCB7IFByb21pc2VEdG8gfSBmcm9tIFwiLi4vLi4vYXBpL3Byb21pc2VzL2FzeW5jLW1hbmFnZXJcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGlzdGljc0NvbW1hbmRPcHRpb25zIGV4dGVuZHMgQ0xJQXJndW1lbnRzT2JqZWN0IHtcclxuICAgIHNob3dJbkJ5dGVzOiBib29sZWFuO1xyXG59XHJcbi8qKlxyXG4gKiBDTEkgY29tbWFuZCBgc3RhdHNgIGNsYXNzLlxyXG4gKlxyXG4gKiBQcm92aWRlcyBhIHN0YXRpc3RpY3MgYWJvdXQgYmxvYnMgaW4gQXp1cmUgU3RvcmFnZSBhY2NvdW50IGNvbnRhaW5lcnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3RhdGlzdGljc0NvbW1hbmRDbGFzcyBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGUge1xyXG4gICAgcHVibGljIGNvbW1hbmQ6IHN0cmluZyA9IFwic3RhdHNcIjtcclxuXHJcbiAgICBwdWJsaWMgZGVzY3JpYmU6IHN0cmluZyA9IFwiUmV0cmlldmVzIHN0YXRpc3RpY3Mgb2YgYSBTdG9yYWdlIGFjY291bnQgb3IgYSBjb250YWluZXIuXCI7XHJcblxyXG4gICAgcHVibGljIGJ1aWxkZXI6IENvbW1hbmRCdWlsZGVyID0ge1xyXG4gICAgICAgIHNob3dJbkJ5dGVzOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGhhbmRsZXIgPSBhc3luYyAob3B0aW9uczogU3RhdGlzdGljc0NvbW1hbmRPcHRpb25zKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnUGF0aCA9IFJlc29sdmVDb25maWdQYXRoKG9wdGlvbnMuY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKGBSZWFkaW5nIGNvbmZpZyBmcm9tIFwiJHtjb25maWdQYXRofVwiLmApO1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBSZWFkQ29uZmlnKGNvbmZpZ1BhdGgpO1xyXG5cclxuICAgICAgICAgICAgQWRkRmlsZU1lc3NhZ2VIYW5kbGVyKGNvbmZpZy5sb2dQYXRoLCBjb25maWcubm9Mb2dGaWxlKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdG9yYWdlQWNjb3VudE1hbmFnZXIgPSBuZXcgU3RvcmFnZUFjY291bnRNYW5hZ2VyKGNvbmZpZywgQ0xJTG9nZ2VyLCBvcHRpb25zLm5vQ2FjaGUpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgc3RvcmFnZUFjY291bnRNYW5hZ2VyLkNoZWNrU2VydmljZVN0YXR1cygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChJc0NvbnRhaW5lck5hbWVWYWxpZChvcHRpb25zLmNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250YWluZXJCbG9icyA9IGF3YWl0IHN0b3JhZ2VBY2NvdW50TWFuYWdlci5GZXRjaENvbnRhaW5lckJsb2JzTGlzdChvcHRpb25zLmNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBuZXcgVGFibGUoQmxvYnNMaXN0VGFibGVDb25maWcpIGFzIFRhYmxlLkhvcml6b250YWxUYWJsZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBDb25zdHJ1Y3RTdGF0aXN0aWNzVGFibGVSb3coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJCbG9icyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zaG93SW5CeXRlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdEJsb2JSZXN1bHRHZXR0ZXJcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYmxlLnB1c2gocm93KTtcclxuICAgICAgICAgICAgICAgICAgICBDTElMb2dnZXIuSW5mbyhFT0wgKyB0YWJsZS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyc0Jsb2JzID0gYXdhaXQgc3RvcmFnZUFjY291bnRNYW5hZ2VyLkZldGNoQ29udGFpbmVyc0Jsb2JzTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NmdWxseUZldGNoZWRMaXN0VGl0bGUgPSBgU3VjY2Vzc2Z1bGx5IGZldGNoZWQgYmxvYnMgbGlzdHMgKCR7Y29udGFpbmVyc0Jsb2JzLlN1Y2NlZWRlZC5sZW5ndGh9KTpgO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NPdXRwdXRTdHJpbmcgPSB0aGlzLnJlc29sdmVTdWNjZWVkZWRCbG9ic0xpc3RzVGFibGVTdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWxseUZldGNoZWRMaXN0VGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnNCbG9icy5TdWNjZWVkZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2hvd0luQnl0ZXNcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKHN1Y2Nlc3NPdXRwdXRTdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyc0Jsb2JzLkZhaWxlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhaWx1cmVUaXRsZSA9IGBGYWlsZWQgdG8gZmV0Y2ggJHtjb250YWluZXJzQmxvYnMuRmFpbGVkLmxlbmd0aH0gYmxvYnMgbGlzdHM6YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbHVyZU91dHB1dFN0cmluZyA9IHRoaXMucmVzb2x2ZUZhaWxlZEJsb2JzTGlzdHNUYWJsZVN0cmluZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmVUaXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnNCbG9icy5GYWlsZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNob3dJbkJ5dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKGZhaWx1cmVPdXRwdXRTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIENMSUxvZ2dlci5Dcml0aWNhbChcIkZhaWxlZCB0byBnZXQgc3RhdGlzdGljcyBvZiBhIHN0b3JhZ2UgYWNjb3VudC5cIiwgRU9MLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBjYXRjaCAoY29uZmlnRXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihjb25maWdFcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVzb2x2ZUZhaWxlZEJsb2JzTGlzdHNUYWJsZVN0cmluZyhcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIGZhaWx1cmVzTGlzdDogQXJyYXk8UHJvbWlzZUR0bzxCbG9iU2VydmljZS5Db250YWluZXJSZXN1bHQsIHVuZGVmaW5lZD4+LFxyXG4gICAgICAgIHNob3dJbkJ5dGVzOiBib29sZWFuID0gZmFsc2VcclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGZpbmFsU3RyaW5nID0gdGl0bGUgKyBFT0w7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgYmxvYnNSZXN1bHRMaXN0IG9mIGZhaWx1cmVzTGlzdCkge1xyXG4gICAgICAgICAgICBmaW5hbFN0cmluZyArPSBgJHtibG9ic1Jlc3VsdExpc3QuRGF0YS5uYW1lfToke0VPTH0qICAgICAke2Jsb2JzUmVzdWx0TGlzdC5FcnJvcn1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbmFsU3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVzb2x2ZVN1Y2NlZWRlZEJsb2JzTGlzdHNUYWJsZVN0cmluZyhcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIGNvbnRhaW5lcnNCbG9ic0xpc3Q6IEFycmF5PFByb21pc2VEdG88QmxvYlNlcnZpY2UuQ29udGFpbmVyUmVzdWx0LCBCbG9iU2VydmljZS5CbG9iUmVzdWx0W10+PixcclxuICAgICAgICBzaG93SW5CeXRlczogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICApOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHRhYmxlID0gbmV3IFRhYmxlKEJsb2JzTGlzdFRhYmxlQ29uZmlnKSBhcyBUYWJsZS5Ib3Jpem9udGFsVGFibGU7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgYmxvYnNSZXN1bHRzTGlzdCBvZiBjb250YWluZXJzQmxvYnNMaXN0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IENvbnN0cnVjdFN0YXRpc3RpY3NUYWJsZVJvdyhcclxuICAgICAgICAgICAgICAgIGJsb2JzUmVzdWx0c0xpc3QuRGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgYmxvYnNSZXN1bHRzTGlzdC5SZXN1bHQsXHJcbiAgICAgICAgICAgICAgICBzaG93SW5CeXRlcyxcclxuICAgICAgICAgICAgICAgIERlZmF1bHRCbG9iUmVzdWx0R2V0dGVyXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRhYmxlLnB1c2gocm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aXRsZSArIEVPTCArIHRhYmxlLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTdGF0aXN0aWNzQ29tbWFuZCA9IG5ldyBTdGF0aXN0aWNzQ29tbWFuZENsYXNzO1xyXG4iXX0=