"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Table = require("cli-table2");
var os_1 = require("os");
var azure_storage_1 = require("azure-storage");
var cli_helpers_1 = require("../cli-helpers");
var cli_logger_1 = require("../logger/cli-logger");
var storage_account_manager_1 = require("../../api/managers/storage-account/storage-account-manager");
/**
 * CLI command `sync` class.
 *
 * Downloads all blobs that are missing in your file system.
 */
var SynchronizationCommandClass = /** @class */ (function () {
    function SynchronizationCommandClass() {
        var _this = this;
        this.command = "sync";
        this.describe = "Synchronizes storage account content in Azure and your outDir.";
        this.handler = function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var configPath, config, storageAccountManager, downloadedContainerBlobs, table, row, downloadedContainersBlobs, succeededTitle, succeededListString, failureTitle, failuresListString, error_1, configError_1;
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
                        return [4 /*yield*/, storageAccountManager.DownloadContainerBlobs(options.container)];
                    case 3:
                        downloadedContainerBlobs = _a.sent();
                        if (downloadedContainerBlobs != null) {
                            table = new Table(cli_helpers_1.BlobsListTableConfig);
                            row = cli_helpers_1.ConstructStatisticsTableRow(options.container, downloadedContainerBlobs.Succeeded, options.showInBytes, function (item) { return item.Result.Result; });
                            table.push(row);
                            cli_logger_1.CLILogger.Info("Container downloads statistics:" + os_1.EOL + table.toString());
                        }
                        else {
                            cli_logger_1.CLILogger.Info("All container \"" + options.container + "\" blobs already downloaded.");
                        }
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, storageAccountManager.DownloadContainersBlobs()];
                    case 5:
                        downloadedContainersBlobs = _a.sent();
                        if (downloadedContainersBlobs.length === 0) {
                            cli_logger_1.CLILogger.Info("Storage account \"" + config.storageAccount + "\" successfully synchronized.");
                        }
                        else {
                            succeededTitle = "Succeeded downloads statistics:";
                            succeededListString = this.getSucceededBlobsListsString(succeededTitle, downloadedContainersBlobs);
                            cli_logger_1.CLILogger.Info(succeededListString);
                            failureTitle = "Failed downloads statistics:";
                            failuresListString = this.getFailedBlobsListsString(failureTitle, downloadedContainersBlobs);
                            if (failuresListString) {
                                cli_logger_1.CLILogger.Info(failuresListString);
                            }
                        }
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        cli_logger_1.CLILogger.Critical("Failed to download containers blobs. " + os_1.EOL + error_1);
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        configError_1 = _a.sent();
                        cli_logger_1.CLILogger.Critical(azure_storage_1.Logger.LogLevels.CRITICAL, configError_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    }
    SynchronizationCommandClass.prototype.getSucceededBlobsListsString = function (title, containerDownloadsList, showInBytes) {
        if (showInBytes === void 0) { showInBytes = false; }
        var table = new Table(cli_helpers_1.BlobsListTableConfig);
        try {
            for (var containerDownloadsList_1 = tslib_1.__values(containerDownloadsList), containerDownloadsList_1_1 = containerDownloadsList_1.next(); !containerDownloadsList_1_1.done; containerDownloadsList_1_1 = containerDownloadsList_1.next()) {
                var containerResultsList = containerDownloadsList_1_1.value;
                var row = cli_helpers_1.ConstructStatisticsTableRow(
                // Context is always defined when downloading container blobs.
                containerResultsList.Context.ContainerName, containerResultsList.Succeeded, showInBytes, function (item) { return item.Result.Result; });
                table.push(row);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (containerDownloadsList_1_1 && !containerDownloadsList_1_1.done && (_a = containerDownloadsList_1.return)) _a.call(containerDownloadsList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return title + os_1.EOL + table.toString();
        var e_1, _a;
    };
    SynchronizationCommandClass.prototype.getFailedBlobsListsString = function (title, containerDownloadsList, showInBytes) {
        if (showInBytes === void 0) { showInBytes = false; }
        var hasFailedDownloads = false;
        var finalString = title + os_1.EOL;
        try {
            for (var containerDownloadsList_2 = tslib_1.__values(containerDownloadsList), containerDownloadsList_2_1 = containerDownloadsList_2.next(); !containerDownloadsList_2_1.done; containerDownloadsList_2_1 = containerDownloadsList_2.next()) {
                var containerResultList = containerDownloadsList_2_1.value;
                if (containerResultList.Failed.length > 0) {
                    if (!hasFailedDownloads) {
                        hasFailedDownloads = true;
                    }
                    // Context is always defined when downloading container blobs.
                    finalString += "Failed blobs of \"" + containerResultList.Context.ContainerName + "\":" + os_1.EOL;
                    try {
                        for (var _a = tslib_1.__values(containerResultList.Failed), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var failedBlob = _b.value;
                            finalString += "    " + failedBlob.Data.name + ":" + os_1.EOL + "*    " + failedBlob.Error + os_1.EOL;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (containerDownloadsList_2_1 && !containerDownloadsList_2_1.done && (_d = containerDownloadsList_2.return)) _d.call(containerDownloadsList_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return (hasFailedDownloads) ? finalString : undefined;
        var e_3, _d, e_2, _c;
    };
    return SynchronizationCommandClass;
}());
exports.SynchronizationCommandClass = SynchronizationCommandClass;
exports.SynchronizationCommand = new SynchronizationCommandClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tbWFuZHMtbW9kdWxlcy9zeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGtDQUFvQztBQUVwQyx5QkFBeUI7QUFDekIsK0NBQXVDO0FBRXZDLDhDQU13QjtBQUN4QixtREFBd0U7QUFDeEUsc0dBQW1HO0FBRW5HOzs7O0dBSUc7QUFDSDtJQUFBO1FBQUEsaUJBd0dDO1FBdkdVLFlBQU8sR0FBVyxNQUFNLENBQUM7UUFFekIsYUFBUSxHQUFXLGdFQUFnRSxDQUFDO1FBRXBGLFlBQU8sR0FBRyxVQUFPLE9BQTJCOzs7Ozs7d0JBRXJDLFVBQVUsR0FBRywrQkFBaUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3JELHNCQUFTLENBQUMsSUFBSSxDQUFDLDJCQUF3QixVQUFVLFFBQUksQ0FBQyxDQUFDO3dCQUNqRCxNQUFNLEdBQUcsd0JBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFFdEMsa0NBQXFCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7d0JBRzlDLHFCQUFxQixHQUFHLElBQUksK0NBQXFCLENBQUMsTUFBTSxFQUFFLHNCQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1RixxQkFBTSxxQkFBcUIsQ0FBQyxrQkFBa0IsRUFBRSxFQUFBOzt3QkFBaEQsU0FBZ0QsQ0FBQzs2QkFFN0Msa0NBQW9CLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUF2Qyx3QkFBdUM7d0JBQ04scUJBQU0scUJBQXFCLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFBOzt3QkFBaEcsd0JBQXdCLEdBQUcsU0FBcUU7d0JBRXRHLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQzdCLEtBQUssR0FBRyxJ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LENBQUM7UUFDL0IsSUFBSSxXQUFXLEdBQUcsS0FBSyxHQUFHLFFBQUcsQ0FBQzs7WUFFOUIsR0FBRyxDQUFDLENBQThCLElBQUEsMkJBQUEsaUJBQUEsc0JBQXNCLENBQUEsOERBQUE7Z0JBQW5ELElBQU0sbUJBQW1CLG1DQUFBO2dCQUMxQixFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3dCQUN0QixrQkFBa0IsR0FBRyxJQUFJLENBQUM7b0JBQzlCLENBQUM7b0JBRUQsOERBQThEO29CQUM5RCxXQUFXLElBQUksdUJBQW9CLG1CQUFtQixDQUFDLE9BQVEsQ0FBQyxhQUFhLFdBQUssUUFBSyxDQUFDOzt3QkFDeEYsR0FBRyxDQUFDLENBQXFCLElBQUEsS0FBQSxpQkFBQSxtQkFBbUIsQ0FBQyxNQUFNLENBQUEsZ0JBQUE7NEJBQTlDLElBQU0sVUFBVSxXQUFBOzRCQUNqQixXQUFXLElBQUksU0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksU0FBSSxRQUFHLGFBQVEsVUFBVSxDQUFDLEtBQUssR0FBRyxRQUFLLENBQUM7eUJBQ3JGOzs7Ozs7Ozs7Z0JBQ0wsQ0FBQzthQUNKOzs7Ozs7Ozs7UUFFRCxNQUFNLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs7SUFDMUQsQ0FBQztJQUNMLGtDQUFDO0FBQUQsQ0FBQyxBQXhHRCxJQXdHQztBQXhHWSxrRUFBMkI7QUEwRzNCLFFBQUEsc0JBQXNCLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRhYmxlIGZyb20gXCJjbGktdGFibGUyXCI7XHJcbmltcG9ydCB7IENvbW1hbmRNb2R1bGUgfSBmcm9tIFwieWFyZ3NcIjtcclxuaW1wb3J0IHsgRU9MIH0gZnJvbSBcIm9zXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJhenVyZS1zdG9yYWdlXCI7XHJcbmltcG9ydCB7IENMSUFyZ3VtZW50c09iamVjdCB9IGZyb20gXCIuLi9jbGktY29udHJhY3RzXCI7XHJcbmltcG9ydCB7XHJcbiAgICBSZXNvbHZlQ29uZmlnUGF0aCxcclxuICAgIFJlYWRDb25maWcsXHJcbiAgICBJc0NvbnRhaW5lck5hbWVWYWxpZCxcclxuICAgIEJsb2JzTGlzdFRhYmxlQ29uZmlnLFxyXG4gICAgQ29uc3RydWN0U3RhdGlzdGljc1RhYmxlUm93XHJcbn0gZnJvbSBcIi4uL2NsaS1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IENMSUxvZ2dlciwgQWRkRmlsZU1lc3NhZ2VIYW5kbGVyIH0gZnJvbSBcIi4uL2xvZ2dlci9jbGktbG9nZ2VyXCI7XHJcbmltcG9ydCB7IFN0b3JhZ2VBY2NvdW50TWFuYWdlciB9IGZyb20gXCIuLi8uLi9hcGkvbWFuYWdlcnMvc3RvcmFnZS1hY2NvdW50L3N0b3JhZ2UtYWNjb3VudC1tYW5hZ2VyXCI7XHJcbmltcG9ydCB7IENvbnRhaW5lcnNEb3dubG9hZGVkQmxvYnNSZXN1bHQgfSBmcm9tIFwiLi4vLi4vYXBpL21hbmFnZXJzL3N0b3JhZ2UtYWNjb3VudC9zdG9yYWdlLWFjY291bnQtY29udHJhY3RzXCI7XHJcbi8qKlxyXG4gKiBDTEkgY29tbWFuZCBgc3luY2AgY2xhc3MuXHJcbiAqXHJcbiAqIERvd25sb2FkcyBhbGwgYmxvYnMgdGhhdCBhcmUgbWlzc2luZyBpbiB5b3VyIGZpbGUgc3lzdGVtLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN5bmNocm9uaXphdGlvbkNvbW1hbmRDbGFzcyBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGUge1xyXG4gICAgcHVibGljIGNvbW1hbmQ6IHN0cmluZyA9IFwic3luY1wiO1xyXG5cclxuICAgIHB1YmxpYyBkZXNjcmliZTogc3RyaW5nID0gXCJTeW5jaHJvbml6ZXMgc3RvcmFnZSBhY2NvdW50IGNvbnRlbnQgaW4gQXp1cmUgYW5kIHlvdXIgb3V0RGlyLlwiO1xyXG5cclxuICAgIHB1YmxpYyBoYW5kbGVyID0gYXN5bmMgKG9wdGlvbnM6IENMSUFyZ3VtZW50c09iamVjdCkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBSZXNvbHZlQ29uZmlnUGF0aChvcHRpb25zLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKGBSZWFkaW5nIGNvbmZpZyBmcm9tIFwiJHtjb25maWdQYXRofVwiLmApO1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBSZWFkQ29uZmlnKGNvbmZpZ1BhdGgpO1xyXG5cclxuICAgICAgICAgICAgQWRkRmlsZU1lc3NhZ2VIYW5kbGVyKGNvbmZpZy5sb2dQYXRoLCBjb25maWcubm9Mb2dGaWxlKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdG9yYWdlQWNjb3VudE1hbmFnZXIgPSBuZXcgU3RvcmFnZUFjY291bnRNYW5hZ2VyKGNvbmZpZywgQ0xJTG9nZ2VyLCBvcHRpb25zLm5vQ2FjaGUpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgc3RvcmFnZUFjY291bnRNYW5hZ2VyLkNoZWNrU2VydmljZVN0YXR1cygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChJc0NvbnRhaW5lck5hbWVWYWxpZChvcHRpb25zLmNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb3dubG9hZGVkQ29udGFpbmVyQmxvYnMgPSBhd2FpdCBzdG9yYWdlQWNjb3VudE1hbmFnZXIuRG93bmxvYWRDb250YWluZXJCbG9icyhvcHRpb25zLmNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb3dubG9hZGVkQ29udGFpbmVyQmxvYnMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IG5ldyBUYWJsZShCbG9ic0xpc3RUYWJsZUNvbmZpZykgYXMgVGFibGUuSG9yaXpvbnRhbFRhYmxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBDb25zdHJ1Y3RTdGF0aXN0aWNzVGFibGVSb3coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbnRhaW5lcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkZWRDb250YWluZXJCbG9icy5TdWNjZWVkZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNob3dJbkJ5dGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbSA9PiBpdGVtLlJlc3VsdC5SZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFibGUucHVzaChyb3cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDTElMb2dnZXIuSW5mbyhgQ29udGFpbmVyIGRvd25sb2FkcyBzdGF0aXN0aWNzOiR7RU9MfSR7dGFibGUudG9TdHJpbmcoKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDTElMb2dnZXIuSW5mbyhgQWxsIGNvbnRhaW5lciBcIiR7b3B0aW9ucy5jb250YWluZXJ9XCIgYmxvYnMgYWxyZWFkeSBkb3dubG9hZGVkLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG93bmxvYWRlZENvbnRhaW5lcnNCbG9icyA9IGF3YWl0IHN0b3JhZ2VBY2NvdW50TWFuYWdlci5Eb3dubG9hZENvbnRhaW5lcnNCbG9icygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZG93bmxvYWRlZENvbnRhaW5lcnNCbG9icy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ0xJTG9nZ2VyLkluZm8oYFN0b3JhZ2UgYWNjb3VudCBcIiR7Y29uZmlnLnN0b3JhZ2VBY2NvdW50fVwiIHN1Y2Nlc3NmdWxseSBzeW5jaHJvbml6ZWQuYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VlZGVkVGl0bGUgPSBcIlN1Y2NlZWRlZCBkb3dubG9hZHMgc3RhdGlzdGljczpcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VlZGVkTGlzdFN0cmluZyA9IHRoaXMuZ2V0U3VjY2VlZGVkQmxvYnNMaXN0c1N0cmluZyhzdWNjZWVkZWRUaXRsZSwgZG93bmxvYWRlZENvbnRhaW5lcnNCbG9icyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKHN1Y2NlZWRlZExpc3RTdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbHVyZVRpdGxlID0gXCJGYWlsZWQgZG93bmxvYWRzIHN0YXRpc3RpY3M6XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhaWx1cmVzTGlzdFN0cmluZyA9IHRoaXMuZ2V0RmFpbGVkQmxvYnNMaXN0c1N0cmluZyhmYWlsdXJlVGl0bGUsIGRvd25sb2FkZWRDb250YWluZXJzQmxvYnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZhaWx1cmVzTGlzdFN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ0xJTG9nZ2VyLkluZm8oZmFpbHVyZXNMaXN0U3RyaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIENMSUxvZ2dlci5Dcml0aWNhbChgRmFpbGVkIHRvIGRvd25sb2FkIGNvbnRhaW5lcnMgYmxvYnMuICR7RU9MfSR7ZXJyb3J9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChjb25maWdFcnJvcikge1xyXG4gICAgICAgICAgICBDTElMb2dnZXIuQ3JpdGljYWwoTG9nZ2VyLkxvZ0xldmVscy5DUklUSUNBTCwgY29uZmlnRXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN1Y2NlZWRlZEJsb2JzTGlzdHNTdHJpbmcoXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBjb250YWluZXJEb3dubG9hZHNMaXN0OiBDb250YWluZXJzRG93bmxvYWRlZEJsb2JzUmVzdWx0LFxyXG4gICAgICAgIHNob3dJbkJ5dGVzOiBib29sZWFuID0gZmFsc2VcclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdGFibGUgPSBuZXcgVGFibGUoQmxvYnNMaXN0VGFibGVDb25maWcpIGFzIFRhYmxlLkhvcml6b250YWxUYWJsZTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBjb250YWluZXJSZXN1bHRzTGlzdCBvZiBjb250YWluZXJEb3dubG9hZHNMaXN0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IENvbnN0cnVjdFN0YXRpc3RpY3NUYWJsZVJvdyhcclxuICAgICAgICAgICAgICAgIC8vIENvbnRleHQgaXMgYWx3YXlzIGRlZmluZWQgd2hlbiBkb3dubG9hZGluZyBjb250YWluZXIgYmxvYnMuXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJSZXN1bHRzTGlzdC5Db250ZXh0IS5Db250YWluZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUmVzdWx0c0xpc3QuU3VjY2VlZGVkLFxyXG4gICAgICAgICAgICAgICAgc2hvd0luQnl0ZXMsXHJcbiAgICAgICAgICAgICAgICBpdGVtID0+IGl0ZW0uUmVzdWx0LlJlc3VsdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0YWJsZS5wdXNoKHJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGl0bGUgKyBFT0wgKyB0YWJsZS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RmFpbGVkQmxvYnNMaXN0c1N0cmluZyhcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIGNvbnRhaW5lckRvd25sb2Fkc0xpc3Q6IENvbnRhaW5lcnNEb3dubG9hZGVkQmxvYnNSZXN1bHQsXHJcbiAgICAgICAgc2hvd0luQnl0ZXM6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICAgKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgaGFzRmFpbGVkRG93bmxvYWRzID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGZpbmFsU3RyaW5nID0gdGl0bGUgKyBFT0w7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgY29udGFpbmVyUmVzdWx0TGlzdCBvZiBjb250YWluZXJEb3dubG9hZHNMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmIChjb250YWluZXJSZXN1bHRMaXN0LkZhaWxlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0ZhaWxlZERvd25sb2Fkcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc0ZhaWxlZERvd25sb2FkcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29udGV4dCBpcyBhbHdheXMgZGVmaW5lZCB3aGVuIGRvd25sb2FkaW5nIGNvbnRhaW5lciBibG9icy5cclxuICAgICAgICAgICAgICAgIGZpbmFsU3RyaW5nICs9IGBGYWlsZWQgYmxvYnMgb2YgXCIke2NvbnRhaW5lclJlc3VsdExpc3QuQ29udGV4dCEuQ29udGFpbmVyTmFtZX1cIjoke0VPTH1gO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmYWlsZWRCbG9iIG9mIGNvbnRhaW5lclJlc3VsdExpc3QuRmFpbGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluYWxTdHJpbmcgKz0gYCAgICAke2ZhaWxlZEJsb2IuRGF0YS5uYW1lfToke0VPTH0qICAgICR7ZmFpbGVkQmxvYi5FcnJvcn0ke0VPTH1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKGhhc0ZhaWxlZERvd25sb2FkcykgPyBmaW5hbFN0cmluZyA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFN5bmNocm9uaXphdGlvbkNvbW1hbmQgPSBuZXcgU3luY2hyb25pemF0aW9uQ29tbWFuZENsYXNzO1xyXG4iXX0=