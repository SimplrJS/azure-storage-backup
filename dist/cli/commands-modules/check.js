"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Table = require("cli-table2");
var os_1 = require("os");
var cli_helpers_1 = require("../cli-helpers");
var cli_logger_1 = require("../logger/cli-logger");
var storage_account_manager_1 = require("../../api/managers/storage-account/storage-account-manager");
/**
 * CLI command `check` class.
 *
 * Checks if all blobs from Azure Storage were downloaded to your file system.
 */
var CheckWithAzureCommandClass = /** @class */ (function () {
    function CheckWithAzureCommandClass() {
        var _this = this;
        this.command = "check";
        this.describe = "Checks correlation between data in Azure storage account and data in your outDir.";
        this.handler = function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var configPath, config, storageAccountManager, missingContainerBlobsList, table, row, missingContainersBlobsList, tableTitle, outputString, error_1, configError_1;
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
                        return [4 /*yield*/, storageAccountManager.ValidateContainerFiles(options.container)];
                    case 3:
                        missingContainerBlobsList = _a.sent();
                        if (missingContainerBlobsList.length > 0) {
                            table = new Table(cli_helpers_1.BlobsListTableConfig);
                            row = cli_helpers_1.ConstructStatisticsTableRow(options.container, missingContainerBlobsList, options.showInBytes, cli_helpers_1.DefaultBlobResultGetter);
                            table.push(row);
                            cli_logger_1.CLILogger.Info("Check statistics:" + os_1.EOL + table.toString());
                        }
                        else {
                            cli_logger_1.CLILogger.Info("\"" + options.container + "\" has no missing blobs.");
                        }
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, storageAccountManager.ValidateContainersFiles()];
                    case 5:
                        missingContainersBlobsList = _a.sent();
                        tableTitle = "Missing blobs found:";
                        outputString = this.constructMissingBlobsListsString(tableTitle, missingContainersBlobsList, options.showInBytes);
                        cli_logger_1.CLILogger.Info(outputString);
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        cli_logger_1.CLILogger.Critical("Failed to check correlation between data." + os_1.EOL + error_1);
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        configError_1 = _a.sent();
                        cli_logger_1.CLILogger.Critical(configError_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    }
    CheckWithAzureCommandClass.prototype.constructMissingBlobsListsString = function (title, containersBlobsList, showInBytes) {
        if (showInBytes === void 0) { showInBytes = false; }
        var table = new Table(cli_helpers_1.BlobsListTableConfig);
        var hasMissingBlobs = false;
        try {
            for (var containersBlobsList_1 = tslib_1.__values(containersBlobsList), containersBlobsList_1_1 = containersBlobsList_1.next(); !containersBlobsList_1_1.done; containersBlobsList_1_1 = containersBlobsList_1.next()) {
                var blobsResultsList = containersBlobsList_1_1.value;
                if (blobsResultsList.Entries.length > 0) {
                    if (!hasMissingBlobs) {
                        hasMissingBlobs = true;
                    }
                    var row = cli_helpers_1.ConstructStatisticsTableRow(blobsResultsList.ContainerName, blobsResultsList.Entries, showInBytes, cli_helpers_1.DefaultBlobResultGetter);
                    table.push(row);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (containersBlobsList_1_1 && !containersBlobsList_1_1.done && (_a = containersBlobsList_1.return)) _a.call(containersBlobsList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (hasMissingBlobs) {
            return title + os_1.EOL + table.toString();
        }
        else {
            return "No missing blobs found.";
        }
        var e_1, _a;
    };
    return CheckWithAzureCommandClass;
}());
exports.CheckWithAzureCommandClass = CheckWithAzureCommandClass;
exports.CheckWithAzureCommand = new CheckWithAzureCommandClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbW1hbmRzLW1vZHVsZXMvY2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0NBQW9DO0FBR3BDLHlCQUF5QjtBQUV6Qiw4Q0FPd0I7QUFFeEIsbURBQXdFO0FBQ3hFLHNHQUFtRztBQUduRzs7OztHQUlHO0FBQ0g7SUFBQTtRQUFBLGlCQTZFQztRQTVFVSxZQUFPLEdBQVcsT0FBTyxDQUFDO1FBRTFCLGFBQVEsR0FBVyxtRkFBbUYsQ0FBQztRQUV2RyxZQUFPLEdBQUcsVUFBTyxPQUEyQjs7Ozs7O3dCQUVyQyxVQUFVLEdBQUcsK0JBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNyRCxzQkFBUyxDQUFDLElBQUksQ0FBQywyQkFBd0IsVUFBVSxRQUFJLENBQUMsQ0FBQzt3QkFDakQsTUFBTSxHQUFHLHdCQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBRXRDLGtDQUFxQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzs7O3dCQUk5QyxxQkFBcUIsR0FBRyxJQUFJLCtDQUFxQixDQUFDLE1BQU0sRUFBRSxzQkFBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDNUYscUJBQU0scUJBQXFCLENBQUMsa0JBQWtCLEVBQUUsRUFBQTs7d0JBQWhELFNBQWdELENBQUM7NkJBRTdDLGtDQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBdkMsd0JBQXVDO3dCQUNMLHFCQUFNLHFCQUFxQixDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBQTs7d0JBQWpHLHlCQUF5QixHQUFHLFNBQXFFO3dCQUN2RyxFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDakMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLGtDQUFvQixDQUEwQixDQUFDOzRCQUNqRSxHQUFHLEdBQUcseUNBQTJCLENBQ25DLE9BQU8sQ0FBQyxTQUFTLEVBQ2pCLHlCQUF5QixFQUN6QixPQUFPLENBQUMsV0FBVyxFQUNuQixxQ0FBdUIsQ0FDMUIsQ0FBQzs0QkFDRixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNoQixzQkFBUyxDQUFDLElBQUksQ0FBQyxzQkFBb0IsUUFBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUksQ0FBQyxDQUFDO3dCQUNqRSxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLHNCQUFTLENBQUMsSUFBSSxDQUFDLE9BQUksT0FBTyxDQUFDLFNBQVMsNkJBQXlCLENBQUMsQ0FBQzt3QkFDbkUsQ0FBQzs7NEJBRWtDLHFCQUFNLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFLEVBQUE7O3dCQUFsRiwwQkFBMEIsR0FBRyxTQUFxRDt3QkFDbEYsVUFBVSxHQUFHLHNCQUFzQixDQUFDO3dCQUNwQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsRUFBRSwwQkFBMEIsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ3hILHNCQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7Ozt3QkFHakMsc0JBQVMsQ0FBQyxRQUFRLENBQUMsOENBQTRDLFFBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQzs7Ozs7d0JBR2xGLHNCQUFTLENBQUMsUUFBUSxDQUFDLGFBQVcsQ0FBQyxDQUFDOzs7OzthQUV2QyxDQUFBO0lBZ0NMLENBQUM7SUE5QlcscUVBQWdDLEdBQXhDLFVBQ0ksS0FBYSxFQUNiLG1CQUFzRSxFQUN0RSxXQUE0QjtRQUE1Qiw0QkFBQSxFQUFBLG1CQUE0QjtRQUU1QixJQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxrQ0FBb0IsQ0FBMEIsQ0FBQztRQUN2RSxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7O1lBRTVCLEdBQUcsQ0FBQyxDQUEyQixJQUFBLHdCQUFBLGlCQUFBLG1CQUFtQixDQUFBLHdEQUFBO2dCQUE3QyxJQUFNLGdCQUFnQixnQ0FBQTtnQkFDdkIsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7d0JBQ25CLGVBQWUsR0FBRyxJQUFJLENBQUM7b0JBQzNCLENBQUM7b0JBRUQsSUFBTSxHQUFHLEdBQUcseUNBQTJCLENBQ25DLGdCQUFnQixDQUFDLGFBQWEsRUFDOUIsZ0JBQWdCLENBQUMsT0FBTyxFQUN4QixXQUFXLEVBQ1gscUNBQXVCLENBQzFCLENBQUM7b0JBQ0YsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEIsQ0FBQzthQUNKOzs7Ozs7Ozs7UUFFRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsUUFBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMseUJBQXlCLENBQUM7UUFDckMsQ0FBQzs7SUFDTCxDQUFDO0lBQ0wsaUNBQUM7QUFBRCxDQUFDLEFBN0VELElBNkVDO0FBN0VZLGdFQUEwQjtBQStFMUIsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLDBCQUEwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVGFibGUgZnJvbSBcImNsaS10YWJsZTJcIjtcclxuaW1wb3J0IHsgQmxvYlNlcnZpY2UgfSBmcm9tIFwiYXp1cmUtc3RvcmFnZVwiO1xyXG5pbXBvcnQgeyBDb21tYW5kTW9kdWxlIH0gZnJvbSBcInlhcmdzXCI7XHJcbmltcG9ydCB7IEVPTCB9IGZyb20gXCJvc1wiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIFJlc29sdmVDb25maWdQYXRoLFxyXG4gICAgUmVhZENvbmZpZyxcclxuICAgIElzQ29udGFpbmVyTmFtZVZhbGlkLFxyXG4gICAgQmxvYnNMaXN0VGFibGVDb25maWcsXHJcbiAgICBDb25zdHJ1Y3RTdGF0aXN0aWNzVGFibGVSb3csXHJcbiAgICBEZWZhdWx0QmxvYlJlc3VsdEdldHRlclxyXG59IGZyb20gXCIuLi9jbGktaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDTElBcmd1bWVudHNPYmplY3QgfSBmcm9tIFwiLi4vY2xpLWNvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBDTElMb2dnZXIsIEFkZEZpbGVNZXNzYWdlSGFuZGxlciB9IGZyb20gXCIuLi9sb2dnZXIvY2xpLWxvZ2dlclwiO1xyXG5pbXBvcnQgeyBTdG9yYWdlQWNjb3VudE1hbmFnZXIgfSBmcm9tIFwiLi4vLi4vYXBpL21hbmFnZXJzL3N0b3JhZ2UtYWNjb3VudC9zdG9yYWdlLWFjY291bnQtbWFuYWdlclwiO1xyXG5pbXBvcnQgeyBDb250YWluZXJJdGVtc0xpc3QgfSBmcm9tIFwiLi4vLi4vYXBpL21hbmFnZXJzL3N0b3JhZ2UtYWNjb3VudC9zdG9yYWdlLWFjY291bnQtY29udHJhY3RzXCI7XHJcblxyXG4vKipcclxuICogQ0xJIGNvbW1hbmQgYGNoZWNrYCBjbGFzcy5cclxuICpcclxuICogQ2hlY2tzIGlmIGFsbCBibG9icyBmcm9tIEF6dXJlIFN0b3JhZ2Ugd2VyZSBkb3dubG9hZGVkIHRvIHlvdXIgZmlsZSBzeXN0ZW0uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hlY2tXaXRoQXp1cmVDb21tYW5kQ2xhc3MgaW1wbGVtZW50cyBDb21tYW5kTW9kdWxlIHtcclxuICAgIHB1YmxpYyBjb21tYW5kOiBzdHJpbmcgPSBcImNoZWNrXCI7XHJcblxyXG4gICAgcHVibGljIGRlc2NyaWJlOiBzdHJpbmcgPSBcIkNoZWNrcyBjb3JyZWxhdGlvbiBiZXR3ZWVuIGRhdGEgaW4gQXp1cmUgc3RvcmFnZSBhY2NvdW50IGFuZCBkYXRhIGluIHlvdXIgb3V0RGlyLlwiO1xyXG5cclxuICAgIHB1YmxpYyBoYW5kbGVyID0gYXN5bmMgKG9wdGlvbnM6IENMSUFyZ3VtZW50c09iamVjdCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBSZXNvbHZlQ29uZmlnUGF0aChvcHRpb25zLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKGBSZWFkaW5nIGNvbmZpZyBmcm9tIFwiJHtjb25maWdQYXRofVwiLmApO1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBSZWFkQ29uZmlnKGNvbmZpZ1BhdGgpO1xyXG5cclxuICAgICAgICAgICAgQWRkRmlsZU1lc3NhZ2VIYW5kbGVyKGNvbmZpZy5sb2dQYXRoLCBjb25maWcubm9Mb2dGaWxlKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcmFnZUFjY291bnRNYW5hZ2VyID0gbmV3IFN0b3JhZ2VBY2NvdW50TWFuYWdlcihjb25maWcsIENMSUxvZ2dlciwgb3B0aW9ucy5ub0NhY2hlKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHN0b3JhZ2VBY2NvdW50TWFuYWdlci5DaGVja1NlcnZpY2VTdGF0dXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoSXNDb250YWluZXJOYW1lVmFsaWQob3B0aW9ucy5jb250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWlzc2luZ0NvbnRhaW5lckJsb2JzTGlzdCA9IGF3YWl0IHN0b3JhZ2VBY2NvdW50TWFuYWdlci5WYWxpZGF0ZUNvbnRhaW5lckZpbGVzKG9wdGlvbnMuY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWlzc2luZ0NvbnRhaW5lckJsb2JzTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gbmV3IFRhYmxlKEJsb2JzTGlzdFRhYmxlQ29uZmlnKSBhcyBUYWJsZS5Ib3Jpem9udGFsVGFibGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IENvbnN0cnVjdFN0YXRpc3RpY3NUYWJsZVJvdyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlzc2luZ0NvbnRhaW5lckJsb2JzTGlzdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2hvd0luQnl0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBEZWZhdWx0QmxvYlJlc3VsdEdldHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJsZS5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKGBDaGVjayBzdGF0aXN0aWNzOiR7RU9MfSR7dGFibGUudG9TdHJpbmcoKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDTElMb2dnZXIuSW5mbyhgXCIke29wdGlvbnMuY29udGFpbmVyfVwiIGhhcyBubyBtaXNzaW5nIGJsb2JzLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWlzc2luZ0NvbnRhaW5lcnNCbG9ic0xpc3QgPSBhd2FpdCBzdG9yYWdlQWNjb3VudE1hbmFnZXIuVmFsaWRhdGVDb250YWluZXJzRmlsZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZVRpdGxlID0gXCJNaXNzaW5nIGJsb2JzIGZvdW5kOlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dFN0cmluZyA9IHRoaXMuY29uc3RydWN0TWlzc2luZ0Jsb2JzTGlzdHNTdHJpbmcodGFibGVUaXRsZSwgbWlzc2luZ0NvbnRhaW5lcnNCbG9ic0xpc3QsIG9wdGlvbnMuc2hvd0luQnl0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKG91dHB1dFN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBDTElMb2dnZXIuQ3JpdGljYWwoYEZhaWxlZCB0byBjaGVjayBjb3JyZWxhdGlvbiBiZXR3ZWVuIGRhdGEuJHtFT0x9JHtlcnJvcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGNvbmZpZ0Vycm9yKSB7XHJcbiAgICAgICAgICAgIENMSUxvZ2dlci5Dcml0aWNhbChjb25maWdFcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0TWlzc2luZ0Jsb2JzTGlzdHNTdHJpbmcoXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBjb250YWluZXJzQmxvYnNMaXN0OiBBcnJheTxDb250YWluZXJJdGVtc0xpc3Q8QmxvYlNlcnZpY2UuQmxvYlJlc3VsdD4+LFxyXG4gICAgICAgIHNob3dJbkJ5dGVzOiBib29sZWFuID0gZmFsc2VcclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdGFibGUgPSBuZXcgVGFibGUoQmxvYnNMaXN0VGFibGVDb25maWcpIGFzIFRhYmxlLkhvcml6b250YWxUYWJsZTtcclxuICAgICAgICBsZXQgaGFzTWlzc2luZ0Jsb2JzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgYmxvYnNSZXN1bHRzTGlzdCBvZiBjb250YWluZXJzQmxvYnNMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmIChibG9ic1Jlc3VsdHNMaXN0LkVudHJpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFoYXNNaXNzaW5nQmxvYnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNNaXNzaW5nQmxvYnMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IENvbnN0cnVjdFN0YXRpc3RpY3NUYWJsZVJvdyhcclxuICAgICAgICAgICAgICAgICAgICBibG9ic1Jlc3VsdHNMaXN0LkNvbnRhaW5lck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYmxvYnNSZXN1bHRzTGlzdC5FbnRyaWVzLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3dJbkJ5dGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIERlZmF1bHRCbG9iUmVzdWx0R2V0dGVyXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgdGFibGUucHVzaChyb3cpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaGFzTWlzc2luZ0Jsb2JzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aXRsZSArIEVPTCArIHRhYmxlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiTm8gbWlzc2luZyBibG9icyBmb3VuZC5cIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBDaGVja1dpdGhBenVyZUNvbW1hbmQgPSBuZXcgQ2hlY2tXaXRoQXp1cmVDb21tYW5kQ2xhc3M7XHJcbiJdfQ==