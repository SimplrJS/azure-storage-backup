"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs-extra");
var path = require("path");
var os_1 = require("os");
var azure_storage_1 = require("azure-storage");
var simplr_logger_1 = require("simplr-logger");
var container_manager_1 = require("../container-manager");
var blob_manager_1 = require("../blob-manager");
var async_manager_1 = require("../../promises/async-manager");
var blob_helpers_1 = require("../../helpers/blob-helpers");
var cli_helpers_1 = require("../../../cli/cli-helpers");
var progress_logging_handler_1 = require("../../../cli/logger/progress-logging-handler");
var StorageAccountManager = /** @class */ (function () {
    function StorageAccountManager(config, logger, noCache, showProgress) {
        if (noCache === void 0) { noCache = false; }
        if (showProgress === void 0) { showProgress = true; }
        var _this = this;
        this.config = config;
        this.logger = logger;
        this.noCache = noCache;
        this.showProgress = showProgress;
        this.progressLogLevels = [
            simplr_logger_1.LogLevel.Debug,
            simplr_logger_1.LogLevel.Error,
            simplr_logger_1.LogLevel.Warning
        ];
        // #endregion Logging
        // #region Promise handlers
        this.downloadBlobsHandler = function (blobResult, context) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var containerName, blobDestinationPath, writeStream, downloadedBlob, blobContentLength, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        containerName = context.ContainerName;
                        blobDestinationPath = this.GetContainerBlobDownloadPath(containerName, blobResult.name);
                        return [4 /*yield*/, fs.ensureDir(path.dirname(blobDestinationPath))];
                    case 1:
                        _a.sent();
                        writeStream = fs.createWriteStream(blobDestinationPath);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        this.logger.Debug("Downloading \"" + blobResult.name + "\" from \"" + containerName + "\".");
                        return [4 /*yield*/, blob_helpers_1.GetBlobToStream(this.blobService, containerName, blobResult.name, writeStream)];
                    case 3:
                        downloadedBlob = _a.sent();
                        blobContentLength = Number(blobResult.contentLength);
                        if (!isFinite(blobContentLength)) {
                            throw new Error("Blob \"" + blobResult.name + "\" from \"" + containerName + "\" content length is not a finite number.");
                        }
                        if (blobContentLength === downloadedBlob.LocalContentLength) {
                            this.logger.Debug("Container's \"" + containerName + "\" blob \"" + blobResult.name + "\" successfully downloaded.");
                            writeStream.close();
                            return [2 /*return*/, downloadedBlob];
                        }
                        else {
                            throw new Error("Blob \"" + blobResult.name + "\" content length in Azure (" + blobContentLength + ")" +
                                ("and locally (" + downloadedBlob.LocalContentLength + ") are different."));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.logger.Error("Failed to download \"" + blobResult.name + "\" from \"" + containerName + "\"");
                        writeStream.close();
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.blobsListFetchHandler = function (containerResult) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var results;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.FetchContainerBlobsList(containerResult.name)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        }); };
        this.blobService = azure_storage_1.createBlobService(this.config.storageAccount, this.config.storageAccessKey, this.config.storageHost);
        this.containersManager = new container_manager_1.ContainerManager(this.blobService);
        this.progressLoggingHandler = new progress_logging_handler_1.ProgressLoggingHandler();
        this.logger.UpdateConfiguration(function (configBuilder) { return configBuilder
            .AddWriteMessageHandler({ Handler: _this.progressLoggingHandler }, _this.progressLogLevels)
            .Build(); });
    }
    // #endregion Private variables
    /**
     * Checks current Azure storage account service status.
     */
    StorageAccountManager.prototype.CheckServiceStatus = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.Info("Checking service connectivity with storage account \"" + this.config.storageAccount + "\".");
                        return [4 /*yield*/, blob_helpers_1.GetServiceProperties(this.blobService)];
                    case 1:
                        _a.sent();
                        this.logger.Info("Successfully connected to storage account \"" + this.config.storageAccount + "\".");
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.Critical("Failed to connect to storage account \"" + this.config.storageAccount + "\".");
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieves containers list of current Azure storage account.
     */
    StorageAccountManager.prototype.FetchAllContainers = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var cachedBlobsList, error_3, containersList, error_4;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.noCache) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.logger.Debug("Searching for " + this.config.storageAccount + " containers list in cache.");
                        return [4 /*yield*/, this.GetCachedContainersList()];
                    case 2:
                        cachedBlobsList = _a.sent();
                        this.logger.Info("\"" + this.config.storageAccount + "\" containers list fetched from cache.");
                        return [2 /*return*/, cachedBlobsList.Entries];
                    case 3:
                        error_3 = _a.sent();
                        this.logger.Error("Failed to get cached containers list for storage account \"" + this.config.storageAccount + "\".");
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 7, , 8]);
                        this.logger.Debug("Fetching all containers from storage account \"" + this.config.storageAccount + "\".");
                        return [4 /*yield*/, this.containersManager.FetchAll()];
                    case 5:
                        containersList = _a.sent();
                        this.logger.Info("Fetched " + this.containersManager.Entries.length + " container objects" +
                            (" from storage account \"" + this.config.storageAccount + "\"."));
                        this.logger.Debug("Caching " + containersList.length + " \"" + this.config.storageAccount + "\" containers list entries.");
                        return [4 /*yield*/, this.saveContainersList(containersList)];
                    case 6:
                        _a.sent();
                        this.logger.Info(containersList.length + " " + this.config.storageAccount + " containers entries cached.");
                        return [2 /*return*/, containersList];
                    case 7:
                        error_4 = _a.sent();
                        this.logger.Error("Failed to fetch containers list of a storage account \"" + this.config.storageAccount + "\". " + os_1.EOL + " " + error_4 + "}");
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // #region BlobsLists
    /**
     * Retrieves blobs list in all containers of current Azure storage account.
     */
    StorageAccountManager.prototype.FetchContainersBlobsList = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var containersList, asyncManager, result, error_5;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.FetchAllContainers()];
                    case 1:
                        containersList = _a.sent();
                        this.logger.Info("Fetching blobs list from " + containersList.length + " containers.");
                        asyncManager = new async_manager_1.AsyncManager(this.blobsListFetchHandler, undefined, this.config.maxRetriesCount);
                        if (this.showProgress) {
                            this.progressLoggingHandler.NewProgress(containersList.length);
                            asyncManager.OnSinglePromiseFinished = function () {
                                _this.progressLoggingHandler.Tick();
                            };
                        }
                        this.progressLoggingHandler.ClearProgress();
                        return [4 /*yield*/, asyncManager.Start(containersList)];
                    case 2:
                        result = _a.sent();
                        this.logger.Info("Fetched blobs list from " + containersList.length + " containers.");
                        return [2 /*return*/, result];
                    case 3:
                        error_5 = _a.sent();
                        this.logger.Error("Failed to fetch blobs list from " + this.config.storageAccount + " containers.");
                        return [2 /*return*/, { Failed: [], Succeeded: [] }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieves blobs list of a container.
     *
     * @param {string} containerName Container in your current Azure storage account.
     */
    StorageAccountManager.prototype.FetchContainerBlobsList = function (containerName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var blobsList, cachedBlobsList, error_6, blobManager, error_7;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.noCache) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.logger.Debug("Searching for container's blob list in cache.");
                        return [4 /*yield*/, this.GetContainerCachedBlobsList(containerName)];
                    case 2:
                        cachedBlobsList = _a.sent();
                        this.logger.Debug("\"" + containerName + "\" container's blob list fetched from cache.");
                        blobsList = cachedBlobsList.Entries;
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        this.logger.Error("Failed to get cached blob list for container \"" + containerName + "\".");
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(blobsList == null)) return [3 /*break*/, 9];
                        blobManager = new blob_manager_1.BlobManager(this.blobService, containerName);
                        this.logger.Debug("Fetching blobs list of \"" + containerName + "\" from Azure.");
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, blobManager.FetchAll()];
                    case 6:
                        blobsList = _a.sent();
                        this.logger.Debug("\"" + containerName + "\" blobs list fetched successfully.\"");
                        return [4 /*yield*/, this.saveBlobsList(containerName, blobsList)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_7 = _a.sent();
                        this.logger.Error("Failed to fetch blobs list of " + containerName + " from Azure.");
                        throw error_7;
                    case 9: return [2 /*return*/, blobsList];
                }
            });
        });
    };
    // #endregion Blobs Lists
    // #region Files validation
    /**
     * Retrieves missing Azure storage account container files in local system.
     */
    StorageAccountManager.prototype.ValidateContainerFiles = function (containerName, clearCache) {
        if (clearCache === void 0) { clearCache = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var downloadsListPath, cachedDownloadsList, error_8, blobsList, containerSourcePath, localFilesList, downloadsList;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.Debug("Validating \"" + containerName + "\" downloaded files with blobs list.");
                        downloadsListPath = this.GetContainerDownloadsListPath(containerName);
                        if (!!this.noCache) return [3 /*break*/, 9];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        this.logger.Debug("Getting cached \"" + containerName + "\" downloads list.");
                        return [4 /*yield*/, fs.readJson(downloadsListPath)];
                    case 2:
                        cachedDownloadsList = _a.sent();
                        if (!(cachedDownloadsList != null)) return [3 /*break*/, 5];
                        this.logger.Debug("\"" + containerName + "\" cached downloads list found.");
                        if (!clearCache) return [3 /*break*/, 4];
                        return [4 /*yield*/, fs.remove(downloadsListPath)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.outputDownloadsListNotification(cachedDownloadsList.Entries.length, containerName);
                        return [2 /*return*/, cachedDownloadsList.Entries];
                    case 5: 
                    // If empty file found, remove it.
                    return [4 /*yield*/, fs.remove(downloadsListPath)];
                    case 6:
                        // If empty file found, remove it.
                        _a.sent();
                        throw new Error("No content in cached file");
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_8 = _a.sent();
                        this.logger.Warn("Failed to get cached \"" + containerName + "\" container downloads list.");
                        return [3 /*break*/, 9];
                    case 9: return [4 /*yield*/, this.FetchContainerBlobsList(containerName)];
                    case 10:
                        blobsList = _a.sent();
                        this.logger.Debug("Getting \"" + containerName + "\" downloaded files list.");
                        containerSourcePath = this.GetContainerDownloadsDestinationPath(containerName);
                        return [4 /*yield*/, blob_helpers_1.GetLocalFilesList(containerSourcePath)];
                    case 11:
                        localFilesList = _a.sent();
                        this.logger.Debug("\"" + containerName + "\" downloaded files list successfully fetched.");
                        downloadsList = new Array();
                        if (localFilesList.length > 0) {
                            downloadsList = blob_helpers_1.FilterMissingBlobsList(blobsList, localFilesList);
                        }
                        else {
                            downloadsList = blobsList;
                        }
                        if (!clearCache) return [3 /*break*/, 13];
                        return [4 /*yield*/, fs.remove(downloadsListPath)];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 15];
                    case 13: 
                    // Save checked list in temp folder. "/tmpdir/{package-name}/{azure-storage-account}/{container-name}/check-list.json"
                    return [4 /*yield*/, this.saveContainerDownloadsList(containerName, downloadsList)];
                    case 14:
                        // Save checked list in temp folder. "/tmpdir/{package-name}/{azure-storage-account}/{container-name}/check-list.json"
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        this.outputDownloadsListNotification(downloadsList.length, containerName);
                        return [2 /*return*/, downloadsList];
                }
            });
        });
    };
    /**
     * Retrieves list of all missing Azure storage account files in local system.
     */
    StorageAccountManager.prototype.ValidateContainersFiles = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var containers, results, containers_1, containers_1_1, container, downloadsList, e_1_1, e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.FetchAllContainers()];
                    case 1:
                        containers = _b.sent();
                        if (this.showProgress) {
                            this.progressLoggingHandler.NewProgress(containers.length);
                        }
                        results = [];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        containers_1 = tslib_1.__values(containers), containers_1_1 = containers_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!containers_1_1.done) return [3 /*break*/, 6];
                        container = containers_1_1.value;
                        return [4 /*yield*/, this.ValidateContainerFiles(container.name)];
                    case 4:
                        downloadsList = _b.sent();
                        results.push({
                            ContainerName: container.name,
                            Entries: downloadsList
                        });
                        this.progressLoggingHandler.Tick();
                        _b.label = 5;
                    case 5:
                        containers_1_1 = containers_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (containers_1_1 && !containers_1_1.done && (_a = containers_1.return)) _a.call(containers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        this.progressLoggingHandler.ClearProgress();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    // #endregion Files validation
    // #region Blobs download
    /**
     * Downloads container blobs that are missing in file system.
     */
    StorageAccountManager.prototype.DownloadContainerBlobs = function (containerName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var downloadsList, asyncManager, results;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ValidateContainerFiles(containerName, true)];
                    case 1:
                        downloadsList = _a.sent();
                        if (downloadsList.length === 0) {
                            // All blobs downloaded
                            return [2 /*return*/, undefined];
                        }
                        asyncManager = new async_manager_1.AsyncManager(this.downloadBlobsHandler, this.config.simultaneousDownloadsCount, this.config.maxRetriesCount);
                        if (this.showProgress) {
                            this.progressLoggingHandler.NewProgress(downloadsList.length);
                            asyncManager.OnSinglePromiseFinished = function () {
                                _this.progressLoggingHandler.Tick();
                            };
                        }
                        return [4 /*yield*/, asyncManager.Start(downloadsList, { ContainerName: containerName })];
                    case 2:
                        results = _a.sent();
                        this.logger.Info("\"" + containerName + "\" results: " + results.Succeeded.length + " - downloads succeeded", " " + results.Failed.length + " - downloads failed.");
                        this.progressLoggingHandler.ClearProgress();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Downloads all missing blobs that are missing in file system.
     */
    StorageAccountManager.prototype.DownloadContainersBlobs = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var containers, results, i, containerName, containerDownloadResults;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.FetchAllContainers()];
                    case 1:
                        containers = _a.sent();
                        results = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < containers.length)) return [3 /*break*/, 5];
                        containerName = containers[i].name;
                        this.logger.Info("Downloading \"" + containerName + "\" blobs (" + this.config.simultaneousDownloadsCount + " concurrently). " +
                            (i + " / " + containers.length + " containers finished."));
                        return [4 /*yield*/, this.DownloadContainerBlobs(containerName)];
                    case 3:
                        containerDownloadResults = _a.sent();
                        if (containerDownloadResults != null) {
                            results.push(containerDownloadResults);
                        }
                        else {
                            this.logger.Info("All container \"" + containerName + "\" blobs already downloaded. " +
                                (i + 1 + " / " + containers.length + " containers finished."));
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    // #endregion Blobs download
    // #endregion Storage account actions
    // #region Cache control
    StorageAccountManager.prototype.saveContainersList = function (entries) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var containersList, containersListDirectory;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        containersList = {
                            StorageAccount: this.config.storageAccount,
                            TimeStamp: Date.now(),
                            Entries: entries
                        };
                        containersListDirectory = path.parse(this.ContainersListPath).dir;
                        return [4 /*yield*/, fs.ensureDir(containersListDirectory)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs.writeJSON(this.ContainersListPath, containersList)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StorageAccountManager.prototype.saveBlobsList = function (containerName, entries) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var listPath, directory, blobsList;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.Debug("Caching " + entries.length + " \"" + containerName + "\" blob list entries.");
                        listPath = this.GetContainerBlobsListPath(containerName);
                        directory = path.parse(listPath).dir;
                        return [4 /*yield*/, fs.ensureDir(directory)];
                    case 1:
                        _a.sent();
                        blobsList = {
                            ContainerName: containerName,
                            TimeStamp: Date.now(),
                            Entries: entries
                        };
                        return [4 /*yield*/, fs.writeJSON(listPath, blobsList)];
                    case 2:
                        _a.sent();
                        this.logger.Debug(entries.length + " \"" + containerName + "\" blob list entries. Successfully cached.");
                        return [2 /*return*/];
                }
            });
        });
    };
    StorageAccountManager.prototype.saveContainerDownloadsList = function (containerName, entries) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var blobsListPath, downloadsList;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.Debug("Caching " + entries.length + " \"" + containerName + "\" missing blobs list entries.");
                        blobsListPath = this.GetContainerDownloadsListPath(containerName);
                        downloadsList = {
                            ContainerName: containerName,
                            TimeStamp: Date.now(),
                            Entries: entries
                        };
                        return [4 /*yield*/, fs.writeJSON(blobsListPath, downloadsList)];
                    case 1:
                        _a.sent();
                        this.logger.Debug(entries.length + " \"" + containerName + "\" missing blobs list entries. Successfully cached.");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get containers blobs lists from cache.
     */
    StorageAccountManager.prototype.GetContainerCachedBlobsList = function (containerName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var blobsListPath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blobsListPath = this.GetContainerBlobsListPath(containerName);
                        return [4 /*yield*/, fs.readJSON(blobsListPath)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets containers list from cache.
     */
    StorageAccountManager.prototype.GetCachedContainersList = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var containersListPath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        containersListPath = this.ContainersListPath;
                        return [4 /*yield*/, fs.readJSON(containersListPath)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Object.defineProperty(StorageAccountManager.prototype, "StorageAccountTempPath", {
        // #endregion Cache control
        // #region Paths
        // #region Temporary data paths
        /**
         * Generates directory path of Storage account temporary data.
         */
        get: function () {
            return path.join(os_1.tmpdir(), cli_helpers_1.PACKAGE_JSON.name, this.config.storageAccount);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StorageAccountManager.prototype, "ContainersListPath", {
        /**
         * Generates containers list temporary JSON path.
         */
        get: function () {
            return path.join(this.StorageAccountTempPath, "containers.json");
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Generates container blobs list temporary JSON path.
     */
    StorageAccountManager.prototype.GetContainerBlobsListPath = function (containerName) {
        return path.join(this.StorageAccountTempPath, containerName, "blobs-list.json");
    };
    /**
     * Generates container downloads list temporary JSON path.
     */
    StorageAccountManager.prototype.GetContainerDownloadsListPath = function (containerName) {
        return path.join(this.StorageAccountTempPath, containerName, "downloads-list.json");
    };
    // #endregion Temporary data paths
    // #region Data output paths
    /**
     * Retrieves container downloads destination path.
     */
    StorageAccountManager.prototype.GetContainerDownloadsDestinationPath = function (containerName) {
        return path.join(this.config.outDir, this.config.storageAccount, containerName);
    };
    /**
     * Retrieves downloaded blob destination path.
     */
    StorageAccountManager.prototype.GetContainerBlobDownloadPath = function (containerName, blobName) {
        return path.join(this.GetContainerDownloadsDestinationPath(containerName), blobName);
    };
    //#endregion Data output paths
    // #region Logging
    StorageAccountManager.prototype.outputDownloadsListNotification = function (downloadsListLength, containerName) {
        if (downloadsListLength === 0) {
            this.logger.Debug("All \"" + containerName + "\" blobs from Azure storage account " +
                ("\"" + this.config.storageAccount + "\" are stored locally."));
        }
        else {
            this.logger.Warn("Found " + downloadsListLength + " blobs missing in \"" + containerName + "\"");
        }
    };
    return StorageAccountManager;
}());
exports.StorageAccountManager = StorageAccountManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1hY2NvdW50LW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL21hbmFnZXJzL3N0b3JhZ2UtYWNjb3VudC9zdG9yYWdlLWFjY291bnQtbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBK0I7QUFDL0IsMkJBQTZCO0FBQzdCLHlCQUFpQztBQUNqQywrQ0FBK0Q7QUFDL0QsK0NBQXdEO0FBV3hELDBEQUF3RDtBQUN4RCxnREFBOEM7QUFDOUMsOERBQW1HO0FBRW5HLDJEQUtvQztBQUVwQyx3REFBd0Q7QUFDeEQseUZBQXNGO0FBRXRGO0lBQ0ksK0JBQ1ksTUFBa0IsRUFDbEIsTUFBcUIsRUFDckIsT0FBd0IsRUFDeEIsWUFBNEI7UUFENUIsd0JBQUEsRUFBQSxlQUF3QjtRQUN4Qiw2QkFBQSxFQUFBLG1CQUE0QjtRQUp4QyxpQkFlQztRQWRXLFdBQU0sR0FBTixNQUFNLENBQVk7UUFDbEIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUNyQixZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQUN4QixpQkFBWSxHQUFaLFlBQVksQ0FBZ0I7UUFtQnZCLHNCQUFpQixHQUFlO1lBQzdDLHdCQUFRLENBQUMsS0FBSztZQUNkLHdCQUFRLENBQUMsS0FBSztZQUNkLHdCQUFRLENBQUMsT0FBTztTQUNuQixDQUFDO1FBK1lGLHFCQUFxQjtRQUVyQiwyQkFBMkI7UUFDbkIseUJBQW9CLEdBQ3hCLFVBQU8sVUFBVSxFQUFFLE9BQU87Ozs7O3dCQUVoQixhQUFhLEdBQUcsT0FBUSxDQUFDLGFBQWEsQ0FBQzt3QkFFdkMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTlGLHFCQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUE7O3dCQUFy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QW9DLGFBQXFCLEVBQUUsUUFBZ0I7UUFDdkUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFDRCw4QkFBOEI7SUFFOUIsa0JBQWtCO0lBQ1YsK0RBQStCLEdBQXZDLFVBQXdDLG1CQUEyQixFQUFFLGFBQXFCO1FBQ3RGLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBUSxhQUFhLHlDQUFxQztpQkFDeEUsT0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsMkJBQXVCLENBQUEsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVMsbUJBQW1CLDRCQUFzQixhQUFhLE9BQUcsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7SUFDTCxDQUFDO0lBOENMLDRCQUFDO0FBQUQsQ0FBQyxBQXhkRCxJQXdkQztBQXhkWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyB0bXBkaXIsIEVPTCB9IGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgeyBjcmVhdGVCbG9iU2VydmljZSwgQmxvYlNlcnZpY2UgfSBmcm9tIFwiYXp1cmUtc3RvcmFnZVwiO1xyXG5pbXBvcnQgeyBMb2dnZXJCdWlsZGVyLCBMb2dMZXZlbCB9IGZyb20gXCJzaW1wbHItbG9nZ2VyXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgQ29uZmlnRGF0YSxcclxuICAgIEJsb2JzTGlzdCxcclxuICAgIEJsb2JDb250ZXh0LFxyXG4gICAgQ29udGFpbmVySXRlbXNMaXN0LFxyXG4gICAgQ29udGFpbmVyc0xpc3QsXHJcbiAgICBDb250YWluZXJzRG93bmxvYWRlZEJsb2JzUmVzdWx0LFxyXG4gICAgQ29udGFpbmVyRG93bmxvYWRlZEJsb2JzUmVzdWx0XHJcbn0gZnJvbSBcIi4vc3RvcmFnZS1hY2NvdW50LWNvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBDb250YWluZXJNYW5hZ2VyIH0gZnJvbSBcIi4uL2NvbnRhaW5lci1tYW5hZ2VyXCI7XHJcbmltcG9ydCB7IEJsb2JNYW5hZ2VyIH0gZnJvbSBcIi4uL2Jsb2ItbWFuYWdlclwiO1xyXG5pbXBvcnQgeyBBc3luY01hbmFnZXIsIFByb21pc2VIYW5kbGVyLCBBc3luY1Nlc3Npb25SZXN1bHREdG8gfSBmcm9tIFwiLi4vLi4vcHJvbWlzZXMvYXN5bmMtbWFuYWdlclwiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIEdldFNlcnZpY2VQcm9wZXJ0aWVzLFxyXG4gICAgR2V0TG9jYWxGaWxlc0xpc3QsXHJcbiAgICBGaWx0ZXJNaXNzaW5nQmxvYnNMaXN0LFxyXG4gICAgR2V0QmxvYlRvU3RyZWFtXHJcbn0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvYmxvYi1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IEJsb2JEb3dubG9hZER0byB9IGZyb20gXCIuLi8uLi9jb250cmFjdHMvYmxvYi1oZWxwZXJzLWNvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBQQUNLQUdFX0pTT04gfSBmcm9tIFwiLi4vLi4vLi4vY2xpL2NsaS1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IFByb2dyZXNzTG9nZ2luZ0hhbmRsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY2xpL2xvZ2dlci9wcm9ncmVzcy1sb2dnaW5nLWhhbmRsZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTdG9yYWdlQWNjb3VudE1hbmFnZXIge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWc6IENvbmZpZ0RhdGEsXHJcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlckJ1aWxkZXIsXHJcbiAgICAgICAgcHJpdmF0ZSBub0NhY2hlOiBib29sZWFuID0gZmFsc2UsXHJcbiAgICAgICAgcHJpdmF0ZSBzaG93UHJvZ3Jlc3M6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmJsb2JTZXJ2aWNlID0gY3JlYXRlQmxvYlNlcnZpY2UodGhpcy5jb25maWcuc3RvcmFnZUFjY291bnQsIHRoaXMuY29uZmlnLnN0b3JhZ2VBY2Nlc3NLZXksIHRoaXMuY29uZmlnLnN0b3JhZ2VIb3N0KTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lcnNNYW5hZ2VyID0gbmV3IENvbnRhaW5lck1hbmFnZXIodGhpcy5ibG9iU2VydmljZSk7XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc0xvZ2dpbmdIYW5kbGVyID0gbmV3IFByb2dyZXNzTG9nZ2luZ0hhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXIuVXBkYXRlQ29uZmlndXJhdGlvbihcclxuICAgICAgICAgICAgY29uZmlnQnVpbGRlciA9PiBjb25maWdCdWlsZGVyXHJcbiAgICAgICAgICAgICAgICAuQWRkV3JpdGVNZXNzYWdlSGFuZGxlcih7IEhhbmRsZXI6IHRoaXMucHJvZ3Jlc3NMb2dnaW5nSGFuZGxlciB9LCB0aGlzLnByb2dyZXNzTG9nTGV2ZWxzKVxyXG4gICAgICAgICAgICAgICAgLkJ1aWxkKClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICNyZWdpb24gUHJpdmF0ZSB2YXJpYWJsZXNcclxuICAgIHByaXZhdGUgYmxvYlNlcnZpY2U6IEJsb2JTZXJ2aWNlO1xyXG4gICAgcHJpdmF0ZSBjb250YWluZXJzTWFuYWdlcjogQ29udGFpbmVyTWFuYWdlcjtcclxuXHJcbiAgICBwcml2YXRlIHByb2dyZXNzTG9nZ2luZ0hhbmRsZXI6IFByb2dyZXNzTG9nZ2luZ0hhbmRsZXI7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBwcm9ncmVzc0xvZ0xldmVsczogTG9nTGV2ZWxbXSA9IFtcclxuICAgICAgICBMb2dMZXZlbC5EZWJ1ZyxcclxuICAgICAgICBMb2dMZXZlbC5FcnJvcixcclxuICAgICAgICBMb2dMZXZlbC5XYXJuaW5nXHJcbiAgICBdO1xyXG4gICAgLy8gI2VuZHJlZ2lvbiBQcml2YXRlIHZhcmlhYmxlc1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGN1cnJlbnQgQXp1cmUgc3RvcmFnZSBhY2NvdW50IHNlcnZpY2Ugc3RhdHVzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgQ2hlY2tTZXJ2aWNlU3RhdHVzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYENoZWNraW5nIHNlcnZpY2UgY29ubmVjdGl2aXR5IHdpdGggc3RvcmFnZSBhY2NvdW50IFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIi5gKTtcclxuICAgICAgICAgICAgYXdhaXQgR2V0U2VydmljZVByb3BlcnRpZXModGhpcy5ibG9iU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYFN1Y2Nlc3NmdWxseSBjb25uZWN0ZWQgdG8gc3RvcmFnZSBhY2NvdW50IFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIi5gKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5Dcml0aWNhbChgRmFpbGVkIHRvIGNvbm5lY3QgdG8gc3RvcmFnZSBhY2NvdW50IFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIi5gKTtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGNvbnRhaW5lcnMgbGlzdCBvZiBjdXJyZW50IEF6dXJlIHN0b3JhZ2UgYWNjb3VudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIEZldGNoQWxsQ29udGFpbmVycygpOiBQcm9taXNlPEJsb2JTZXJ2aWNlLkNvbnRhaW5lclJlc3VsdFtdPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5vQ2FjaGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKGBTZWFyY2hpbmcgZm9yICR7dGhpcy5jb25maWcuc3RvcmFnZUFjY291bnR9IGNvbnRhaW5lcnMgbGlzdCBpbiBjYWNoZS5gKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlZEJsb2JzTGlzdCA9IGF3YWl0IHRoaXMuR2V0Q2FjaGVkQ29udGFpbmVyc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIiBjb250YWluZXJzIGxpc3QgZmV0Y2hlZCBmcm9tIGNhY2hlLmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZEJsb2JzTGlzdC5FbnRyaWVzO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRXJyb3IoYEZhaWxlZCB0byBnZXQgY2FjaGVkIGNvbnRhaW5lcnMgbGlzdCBmb3Igc3RvcmFnZSBhY2NvdW50IFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIi5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXIuRGVidWcoYEZldGNoaW5nIGFsbCBjb250YWluZXJzIGZyb20gc3RvcmFnZSBhY2NvdW50IFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIi5gKTtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyc0xpc3QgPSBhd2FpdCB0aGlzLmNvbnRhaW5lcnNNYW5hZ2VyLkZldGNoQWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYEZldGNoZWQgJHt0aGlzLmNvbnRhaW5lcnNNYW5hZ2VyLkVudHJpZXMubGVuZ3RofSBjb250YWluZXIgb2JqZWN0c2AgK1xyXG4gICAgICAgICAgICAgICAgYCBmcm9tIHN0b3JhZ2UgYWNjb3VudCBcIiR7dGhpcy5jb25maWcuc3RvcmFnZUFjY291bnR9XCIuYCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5EZWJ1ZyhgQ2FjaGluZyAke2NvbnRhaW5lcnNMaXN0Lmxlbmd0aH0gXCIke3RoaXMuY29uZmlnLnN0b3JhZ2VBY2NvdW50fVwiIGNvbnRhaW5lcnMgbGlzdCBlbnRyaWVzLmApO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVDb250YWluZXJzTGlzdChjb250YWluZXJzTGlzdCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYCR7Y29udGFpbmVyc0xpc3QubGVuZ3RofSAke3RoaXMuY29uZmlnLnN0b3JhZ2VBY2NvdW50fSBjb250YWluZXJzIGVudHJpZXMgY2FjaGVkLmApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lcnNMaXN0O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggY29udGFpbmVycyBsaXN0IG9mIGEgc3RvcmFnZSBhY2NvdW50IFwiJHt0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudH1cIi4gJHtFT0x9ICR7ZXJyb3J9fWApO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gI3JlZ2lvbiBCbG9ic0xpc3RzXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZXMgYmxvYnMgbGlzdCBpbiBhbGwgY29udGFpbmVycyBvZiBjdXJyZW50IEF6dXJlIHN0b3JhZ2UgYWNjb3VudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIEZldGNoQ29udGFpbmVyc0Jsb2JzTGlzdCgpOiBQcm9taXNlPEFzeW5jU2Vzc2lvblJlc3VsdER0bzxCbG9iU2VydmljZS5Db250YWluZXJSZXN1bHQsIEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHRbXT4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjb250YWluZXJzTGlzdCA9IGF3YWl0IHRoaXMuRmV0Y2hBbGxDb250YWluZXJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYEZldGNoaW5nIGJsb2JzIGxpc3QgZnJvbSAke2NvbnRhaW5lcnNMaXN0Lmxlbmd0aH0gY29udGFpbmVycy5gKTtcclxuICAgICAgICAgICAgY29uc3QgYXN5bmNNYW5hZ2VyID0gbmV3IEFzeW5jTWFuYWdlcjxCbG9iU2VydmljZS5Db250YWluZXJSZXN1bHQsIEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHRbXT4oXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2JzTGlzdEZldGNoSGFuZGxlcixcclxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm1heFJldHJpZXNDb3VudFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1Byb2dyZXNzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzTG9nZ2luZ0hhbmRsZXIuTmV3UHJvZ3Jlc3MoY29udGFpbmVyc0xpc3QubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhc3luY01hbmFnZXIuT25TaW5nbGVQcm9taXNlRmluaXNoZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0xvZ2dpbmdIYW5kbGVyLlRpY2soKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NMb2dnaW5nSGFuZGxlci5DbGVhclByb2dyZXNzKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFzeW5jTWFuYWdlci5TdGFydChjb250YWluZXJzTGlzdCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYEZldGNoZWQgYmxvYnMgbGlzdCBmcm9tICR7Y29udGFpbmVyc0xpc3QubGVuZ3RofSBjb250YWluZXJzLmApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggYmxvYnMgbGlzdCBmcm9tICR7dGhpcy5jb25maWcuc3RvcmFnZUFjY291bnR9IGNvbnRhaW5lcnMuYCk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IEZhaWxlZDogW10sIFN1Y2NlZWRlZDogW10gfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZXMgYmxvYnMgbGlzdCBvZiBhIGNvbnRhaW5lci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGFpbmVyTmFtZSBDb250YWluZXIgaW4geW91ciBjdXJyZW50IEF6dXJlIHN0b3JhZ2UgYWNjb3VudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIEZldGNoQ29udGFpbmVyQmxvYnNMaXN0KGNvbnRhaW5lck5hbWU6IHN0cmluZyk6IFByb21pc2U8QmxvYlNlcnZpY2UuQmxvYlJlc3VsdFtdPiB7XHJcbiAgICAgICAgbGV0IGJsb2JzTGlzdDogQmxvYlNlcnZpY2UuQmxvYlJlc3VsdFtdIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIC8vIFNlYXJjaGluZyBmb3IgY29udGFpbmVyJ3MgYmxvYiBsaXN0IGluIGNhY2hlXHJcbiAgICAgICAgaWYgKCF0aGlzLm5vQ2FjaGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKFwiU2VhcmNoaW5nIGZvciBjb250YWluZXIncyBibG9iIGxpc3QgaW4gY2FjaGUuXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGVkQmxvYnNMaXN0ID0gYXdhaXQgdGhpcy5HZXRDb250YWluZXJDYWNoZWRCbG9ic0xpc3QoY29udGFpbmVyTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5EZWJ1ZyhgXCIke2NvbnRhaW5lck5hbWV9XCIgY29udGFpbmVyJ3MgYmxvYiBsaXN0IGZldGNoZWQgZnJvbSBjYWNoZS5gKTtcclxuICAgICAgICAgICAgICAgIGJsb2JzTGlzdCA9IGNhY2hlZEJsb2JzTGlzdC5FbnRyaWVzO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRXJyb3IoYEZhaWxlZCB0byBnZXQgY2FjaGVkIGJsb2IgbGlzdCBmb3IgY29udGFpbmVyIFwiJHtjb250YWluZXJOYW1lfVwiLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZXR0aW5nIGNvbnRhaW5lcidzIGxpc3QgZnJvbSBBenVyZS5cclxuICAgICAgICBpZiAoYmxvYnNMaXN0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgYmxvYk1hbmFnZXIgPSBuZXcgQmxvYk1hbmFnZXIodGhpcy5ibG9iU2VydmljZSwgY29udGFpbmVyTmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKGBGZXRjaGluZyBibG9icyBsaXN0IG9mIFwiJHtjb250YWluZXJOYW1lfVwiIGZyb20gQXp1cmUuYCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBibG9ic0xpc3QgPSBhd2FpdCBibG9iTWFuYWdlci5GZXRjaEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRGVidWcoYFwiJHtjb250YWluZXJOYW1lfVwiIGJsb2JzIGxpc3QgZmV0Y2hlZCBzdWNjZXNzZnVsbHkuXCJgKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZUJsb2JzTGlzdChjb250YWluZXJOYW1lLCBibG9ic0xpc3QpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBibG9icyBsaXN0IG9mICR7Y29udGFpbmVyTmFtZX0gZnJvbSBBenVyZS5gKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYmxvYnNMaXN0O1xyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvbiBCbG9icyBMaXN0c1xyXG5cclxuICAgIC8vICNyZWdpb24gRmlsZXMgdmFsaWRhdGlvblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIG1pc3NpbmcgQXp1cmUgc3RvcmFnZSBhY2NvdW50IGNvbnRhaW5lciBmaWxlcyBpbiBsb2NhbCBzeXN0ZW0uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBWYWxpZGF0ZUNvbnRhaW5lckZpbGVzKGNvbnRhaW5lck5hbWU6IHN0cmluZywgY2xlYXJDYWNoZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxCbG9iU2VydmljZS5CbG9iUmVzdWx0W10+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5EZWJ1ZyhgVmFsaWRhdGluZyBcIiR7Y29udGFpbmVyTmFtZX1cIiBkb3dubG9hZGVkIGZpbGVzIHdpdGggYmxvYnMgbGlzdC5gKTtcclxuXHJcbiAgICAgICAgY29uc3QgZG93bmxvYWRzTGlzdFBhdGggPSB0aGlzLkdldENvbnRhaW5lckRvd25sb2Fkc0xpc3RQYXRoKGNvbnRhaW5lck5hbWUpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMubm9DYWNoZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRGVidWcoYEdldHRpbmcgY2FjaGVkIFwiJHtjb250YWluZXJOYW1lfVwiIGRvd25sb2FkcyBsaXN0LmApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGVkRG93bmxvYWRzTGlzdCA9IGF3YWl0IGZzLnJlYWRKc29uKGRvd25sb2Fkc0xpc3RQYXRoKSBhcyBCbG9ic0xpc3Q7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGVkRG93bmxvYWRzTGlzdCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRGVidWcoYFwiJHtjb250YWluZXJOYW1lfVwiIGNhY2hlZCBkb3dubG9hZHMgbGlzdCBmb3VuZC5gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsZWFyQ2FjaGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZnMucmVtb3ZlKGRvd25sb2Fkc0xpc3RQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cHV0RG93bmxvYWRzTGlzdE5vdGlmaWNhdGlvbihjYWNoZWREb3dubG9hZHNMaXN0LkVudHJpZXMubGVuZ3RoLCBjb250YWluZXJOYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZERvd25sb2Fkc0xpc3QuRW50cmllcztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgZW1wdHkgZmlsZSBmb3VuZCwgcmVtb3ZlIGl0LlxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZzLnJlbW92ZShkb3dubG9hZHNMaXN0UGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY29udGVudCBpbiBjYWNoZWQgZmlsZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLldhcm4oYEZhaWxlZCB0byBnZXQgY2FjaGVkIFwiJHtjb250YWluZXJOYW1lfVwiIGNvbnRhaW5lciBkb3dubG9hZHMgbGlzdC5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IGNhY2hlZCBibG9iLWxpc3QgYnkgY29udGFpbmVyXHJcbiAgICAgICAgY29uc3QgYmxvYnNMaXN0ID0gYXdhaXQgdGhpcy5GZXRjaENvbnRhaW5lckJsb2JzTGlzdChjb250YWluZXJOYW1lKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXIuRGVidWcoYEdldHRpbmcgXCIke2NvbnRhaW5lck5hbWV9XCIgZG93bmxvYWRlZCBmaWxlcyBsaXN0LmApO1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lclNvdXJjZVBhdGggPSB0aGlzLkdldENvbnRhaW5lckRvd25sb2Fkc0Rlc3RpbmF0aW9uUGF0aChjb250YWluZXJOYW1lKTtcclxuICAgICAgICBjb25zdCBsb2NhbEZpbGVzTGlzdCA9IGF3YWl0IEdldExvY2FsRmlsZXNMaXN0KGNvbnRhaW5lclNvdXJjZVBhdGgpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKGBcIiR7Y29udGFpbmVyTmFtZX1cIiBkb3dubG9hZGVkIGZpbGVzIGxpc3Qgc3VjY2Vzc2Z1bGx5IGZldGNoZWQuYCk7XHJcblxyXG4gICAgICAgIC8vIEZpbHRlcmluZyBtaXNzaW5nIGJsb2JzXHJcbiAgICAgICAgbGV0IGRvd25sb2Fkc0xpc3QgPSBuZXcgQXJyYXk8QmxvYlNlcnZpY2UuQmxvYlJlc3VsdD4oKTtcclxuICAgICAgICBpZiAobG9jYWxGaWxlc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBkb3dubG9hZHNMaXN0ID0gRmlsdGVyTWlzc2luZ0Jsb2JzTGlzdChibG9ic0xpc3QsIGxvY2FsRmlsZXNMaXN0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkb3dubG9hZHNMaXN0ID0gYmxvYnNMaXN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNsZWFyQ2FjaGUpIHtcclxuICAgICAgICAgICAgYXdhaXQgZnMucmVtb3ZlKGRvd25sb2Fkc0xpc3RQYXRoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBTYXZlIGNoZWNrZWQgbGlzdCBpbiB0ZW1wIGZvbGRlci4gXCIvdG1wZGlyL3twYWNrYWdlLW5hbWV9L3thenVyZS1zdG9yYWdlLWFjY291bnR9L3tjb250YWluZXItbmFtZX0vY2hlY2stbGlzdC5qc29uXCJcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlQ29udGFpbmVyRG93bmxvYWRzTGlzdChjb250YWluZXJOYW1lLCBkb3dubG9hZHNMaXN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3V0cHV0RG93bmxvYWRzTGlzdE5vdGlmaWNhdGlvbihkb3dubG9hZHNMaXN0Lmxlbmd0aCwgY29udGFpbmVyTmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkb3dubG9hZHNMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGxpc3Qgb2YgYWxsIG1pc3NpbmcgQXp1cmUgc3RvcmFnZSBhY2NvdW50IGZpbGVzIGluIGxvY2FsIHN5c3RlbS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIFZhbGlkYXRlQ29udGFpbmVyc0ZpbGVzKCk6IFByb21pc2U8QXJyYXk8Q29udGFpbmVySXRlbXNMaXN0PEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHQ+Pj4ge1xyXG4gICAgICAgIC8vIEdldCBibG9iIGNvbnRhaW5lciBsaXN0LCBhbmQgY2hlY2sgb25lIGJ5IG9uZS5cclxuICAgICAgICBjb25zdCBjb250YWluZXJzID0gYXdhaXQgdGhpcy5GZXRjaEFsbENvbnRhaW5lcnMoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd1Byb2dyZXNzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NMb2dnaW5nSGFuZGxlci5OZXdQcm9ncmVzcyhjb250YWluZXJzLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHRzOiBBcnJheTxDb250YWluZXJJdGVtc0xpc3Q8QmxvYlNlcnZpY2UuQmxvYlJlc3VsdD4+ID0gW107XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgY29udGFpbmVyIG9mIGNvbnRhaW5lcnMpIHtcclxuICAgICAgICAgICAgY29uc3QgZG93bmxvYWRzTGlzdCA9IGF3YWl0IHRoaXMuVmFsaWRhdGVDb250YWluZXJGaWxlcyhjb250YWluZXIubmFtZSk7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBDb250YWluZXJOYW1lOiBjb250YWluZXIubmFtZSxcclxuICAgICAgICAgICAgICAgIEVudHJpZXM6IGRvd25sb2Fkc0xpc3RcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NMb2dnaW5nSGFuZGxlci5UaWNrKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnByb2dyZXNzTG9nZ2luZ0hhbmRsZXIuQ2xlYXJQcm9ncmVzcygpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuICAgIC8vICNlbmRyZWdpb24gRmlsZXMgdmFsaWRhdGlvblxyXG5cclxuICAgIC8vICNyZWdpb24gQmxvYnMgZG93bmxvYWRcclxuICAgIC8qKlxyXG4gICAgICogRG93bmxvYWRzIGNvbnRhaW5lciBibG9icyB0aGF0IGFyZSBtaXNzaW5nIGluIGZpbGUgc3lzdGVtLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgRG93bmxvYWRDb250YWluZXJCbG9icyhjb250YWluZXJOYW1lOiBzdHJpbmcpOiBQcm9taXNlPENvbnRhaW5lckRvd25sb2FkZWRCbG9ic1Jlc3VsdCB8IHVuZGVmaW5lZD4ge1xyXG4gICAgICAgIGNvbnN0IGRvd25sb2Fkc0xpc3QgPSBhd2FpdCB0aGlzLlZhbGlkYXRlQ29udGFpbmVyRmlsZXMoY29udGFpbmVyTmFtZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGlmIChkb3dubG9hZHNMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBBbGwgYmxvYnMgZG93bmxvYWRlZFxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXN5bmNNYW5hZ2VyID0gbmV3IEFzeW5jTWFuYWdlcjxCbG9iU2VydmljZS5CbG9iUmVzdWx0LCBCbG9iRG93bmxvYWREdG8sIEJsb2JDb250ZXh0PihcclxuICAgICAgICAgICAgdGhpcy5kb3dubG9hZEJsb2JzSGFuZGxlcixcclxuICAgICAgICAgICAgdGhpcy5jb25maWcuc2ltdWx0YW5lb3VzRG93bmxvYWRzQ291bnQsXHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLm1heFJldHJpZXNDb3VudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3dQcm9ncmVzcykge1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzTG9nZ2luZ0hhbmRsZXIuTmV3UHJvZ3Jlc3MoZG93bmxvYWRzTGlzdC5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgYXN5bmNNYW5hZ2VyLk9uU2luZ2xlUHJvbWlzZUZpbmlzaGVkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0xvZ2dpbmdIYW5kbGVyLlRpY2soKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBhc3luY01hbmFnZXIuU3RhcnQoZG93bmxvYWRzTGlzdCwgeyBDb250YWluZXJOYW1lOiBjb250YWluZXJOYW1lIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlci5JbmZvKFxyXG4gICAgICAgICAgICBgXCIke2NvbnRhaW5lck5hbWV9XCIgcmVzdWx0czogJHtyZXN1bHRzLlN1Y2NlZWRlZC5sZW5ndGh9IC0gZG93bmxvYWRzIHN1Y2NlZWRlZGAsXHJcbiAgICAgICAgICAgIGAgJHtyZXN1bHRzLkZhaWxlZC5sZW5ndGh9IC0gZG93bmxvYWRzIGZhaWxlZC5gXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc0xvZ2dpbmdIYW5kbGVyLkNsZWFyUHJvZ3Jlc3MoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEb3dubG9hZHMgYWxsIG1pc3NpbmcgYmxvYnMgdGhhdCBhcmUgbWlzc2luZyBpbiBmaWxlIHN5c3RlbS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIERvd25sb2FkQ29udGFpbmVyc0Jsb2JzKCk6IFByb21pc2U8Q29udGFpbmVyc0Rvd25sb2FkZWRCbG9ic1Jlc3VsdD4ge1xyXG4gICAgICAgIC8vIEdldCBibG9iIGNvbnRhaW5lciBsaXN0LCBhbmQgY2hlY2sgb25lIGJ5IG9uZS5cclxuICAgICAgICBjb25zdCBjb250YWluZXJzID0gYXdhaXQgdGhpcy5GZXRjaEFsbENvbnRhaW5lcnMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0czogQ29udGFpbmVyc0Rvd25sb2FkZWRCbG9ic1Jlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRhaW5lcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyTmFtZSA9IGNvbnRhaW5lcnNbaV0ubmFtZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYERvd25sb2FkaW5nIFwiJHtjb250YWluZXJOYW1lfVwiIGJsb2JzICgke3RoaXMuY29uZmlnLnNpbXVsdGFuZW91c0Rvd25sb2Fkc0NvdW50fSBjb25jdXJyZW50bHkpLiBgICtcclxuICAgICAgICAgICAgICAgIGAke2l9IC8gJHtjb250YWluZXJzLmxlbmd0aH0gY29udGFpbmVycyBmaW5pc2hlZC5gKTtcclxuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyRG93bmxvYWRSZXN1bHRzID0gYXdhaXQgdGhpcy5Eb3dubG9hZENvbnRhaW5lckJsb2JzKGNvbnRhaW5lck5hbWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lckRvd25sb2FkUmVzdWx0cyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY29udGFpbmVyRG93bmxvYWRSZXN1bHRzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLkluZm8oYEFsbCBjb250YWluZXIgXCIke2NvbnRhaW5lck5hbWV9XCIgYmxvYnMgYWxyZWFkeSBkb3dubG9hZGVkLiBgICtcclxuICAgICAgICAgICAgICAgICAgICBgJHtpICsgMX0gLyAke2NvbnRhaW5lcnMubGVuZ3RofSBjb250YWluZXJzIGZpbmlzaGVkLmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuXHJcbiAgICAvLyAjZW5kcmVnaW9uIEJsb2JzIGRvd25sb2FkXHJcblxyXG4gICAgLy8gI2VuZHJlZ2lvbiBTdG9yYWdlIGFjY291bnQgYWN0aW9uc1xyXG5cclxuICAgIC8vICNyZWdpb24gQ2FjaGUgY29udHJvbFxyXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlQ29udGFpbmVyc0xpc3QoZW50cmllczogQmxvYlNlcnZpY2UuQ29udGFpbmVyUmVzdWx0W10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBjb250YWluZXJzTGlzdDogQ29udGFpbmVyc0xpc3QgPSB7XHJcbiAgICAgICAgICAgIFN0b3JhZ2VBY2NvdW50OiB0aGlzLmNvbmZpZy5zdG9yYWdlQWNjb3VudCxcclxuICAgICAgICAgICAgVGltZVN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICBFbnRyaWVzOiBlbnRyaWVzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgY29udGFpbmVyc0xpc3REaXJlY3RvcnkgPSBwYXRoLnBhcnNlKHRoaXMuQ29udGFpbmVyc0xpc3RQYXRoKS5kaXI7XHJcbiAgICAgICAgYXdhaXQgZnMuZW5zdXJlRGlyKGNvbnRhaW5lcnNMaXN0RGlyZWN0b3J5KTtcclxuICAgICAgICBhd2FpdCBmcy53cml0ZUpTT04odGhpcy5Db250YWluZXJzTGlzdFBhdGgsIGNvbnRhaW5lcnNMaXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNhdmVCbG9ic0xpc3QoY29udGFpbmVyTmFtZTogc3RyaW5nLCBlbnRyaWVzOiBCbG9iU2VydmljZS5CbG9iUmVzdWx0W10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlci5EZWJ1ZyhgQ2FjaGluZyAke2VudHJpZXMubGVuZ3RofSBcIiR7Y29udGFpbmVyTmFtZX1cIiBibG9iIGxpc3QgZW50cmllcy5gKTtcclxuICAgICAgICBjb25zdCBsaXN0UGF0aCA9IHRoaXMuR2V0Q29udGFpbmVyQmxvYnNMaXN0UGF0aChjb250YWluZXJOYW1lKTtcclxuICAgICAgICBjb25zdCBkaXJlY3RvcnkgPSBwYXRoLnBhcnNlKGxpc3RQYXRoKS5kaXI7XHJcblxyXG4gICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihkaXJlY3RvcnkpO1xyXG5cclxuICAgICAgICBjb25zdCBibG9ic0xpc3Q6IEJsb2JzTGlzdCA9IHtcclxuICAgICAgICAgICAgQ29udGFpbmVyTmFtZTogY29udGFpbmVyTmFtZSxcclxuICAgICAgICAgICAgVGltZVN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICBFbnRyaWVzOiBlbnRyaWVzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYXdhaXQgZnMud3JpdGVKU09OKGxpc3RQYXRoLCBibG9ic0xpc3QpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKGAke2VudHJpZXMubGVuZ3RofSBcIiR7Y29udGFpbmVyTmFtZX1cIiBibG9iIGxpc3QgZW50cmllcy4gU3VjY2Vzc2Z1bGx5IGNhY2hlZC5gKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNhdmVDb250YWluZXJEb3dubG9hZHNMaXN0KGNvbnRhaW5lck5hbWU6IHN0cmluZywgZW50cmllczogQmxvYlNlcnZpY2UuQmxvYlJlc3VsdFtdKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIuRGVidWcoYENhY2hpbmcgJHtlbnRyaWVzLmxlbmd0aH0gXCIke2NvbnRhaW5lck5hbWV9XCIgbWlzc2luZyBibG9icyBsaXN0IGVudHJpZXMuYCk7XHJcbiAgICAgICAgY29uc3QgYmxvYnNMaXN0UGF0aCA9IHRoaXMuR2V0Q29udGFpbmVyRG93bmxvYWRzTGlzdFBhdGgoY29udGFpbmVyTmFtZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRvd25sb2Fkc0xpc3Q6IEJsb2JzTGlzdCA9IHtcclxuICAgICAgICAgICAgQ29udGFpbmVyTmFtZTogY29udGFpbmVyTmFtZSxcclxuICAgICAgICAgICAgVGltZVN0YW1wOiBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICBFbnRyaWVzOiBlbnRyaWVzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYXdhaXQgZnMud3JpdGVKU09OKGJsb2JzTGlzdFBhdGgsIGRvd25sb2Fkc0xpc3QpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKGAke2VudHJpZXMubGVuZ3RofSBcIiR7Y29udGFpbmVyTmFtZX1cIiBtaXNzaW5nIGJsb2JzIGxpc3QgZW50cmllcy4gU3VjY2Vzc2Z1bGx5IGNhY2hlZC5gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBjb250YWluZXJzIGJsb2JzIGxpc3RzIGZyb20gY2FjaGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBHZXRDb250YWluZXJDYWNoZWRCbG9ic0xpc3QoY29udGFpbmVyTmFtZTogc3RyaW5nKTogUHJvbWlzZTxCbG9ic0xpc3Q+IHtcclxuICAgICAgICBjb25zdCBibG9ic0xpc3RQYXRoID0gdGhpcy5HZXRDb250YWluZXJCbG9ic0xpc3RQYXRoKGNvbnRhaW5lck5hbWUpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBmcy5yZWFkSlNPTihibG9ic0xpc3RQYXRoKSBhcyBCbG9ic0xpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGNvbnRhaW5lcnMgbGlzdCBmcm9tIGNhY2hlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgR2V0Q2FjaGVkQ29udGFpbmVyc0xpc3QoKTogUHJvbWlzZTxDb250YWluZXJzTGlzdD4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lcnNMaXN0UGF0aCA9IHRoaXMuQ29udGFpbmVyc0xpc3RQYXRoO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBmcy5yZWFkSlNPTihjb250YWluZXJzTGlzdFBhdGgpIGFzIENvbnRhaW5lcnNMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vICNlbmRyZWdpb24gQ2FjaGUgY29udHJvbFxyXG5cclxuICAgIC8vICNyZWdpb24gUGF0aHNcclxuXHJcbiAgICAvLyAjcmVnaW9uIFRlbXBvcmFyeSBkYXRhIHBhdGhzXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZXMgZGlyZWN0b3J5IHBhdGggb2YgU3RvcmFnZSBhY2NvdW50IHRlbXBvcmFyeSBkYXRhLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IFN0b3JhZ2VBY2NvdW50VGVtcFBhdGgoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRtcGRpcigpLCBQQUNLQUdFX0pTT04ubmFtZSwgdGhpcy5jb25maWcuc3RvcmFnZUFjY291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGNvbnRhaW5lcnMgbGlzdCB0ZW1wb3JhcnkgSlNPTiBwYXRoLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IENvbnRhaW5lcnNMaXN0UGF0aCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5TdG9yYWdlQWNjb3VudFRlbXBQYXRoLCBcImNvbnRhaW5lcnMuanNvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlcyBjb250YWluZXIgYmxvYnMgbGlzdCB0ZW1wb3JhcnkgSlNPTiBwYXRoLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgR2V0Q29udGFpbmVyQmxvYnNMaXN0UGF0aChjb250YWluZXJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5TdG9yYWdlQWNjb3VudFRlbXBQYXRoLCBjb250YWluZXJOYW1lLCBcImJsb2JzLWxpc3QuanNvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlcyBjb250YWluZXIgZG93bmxvYWRzIGxpc3QgdGVtcG9yYXJ5IEpTT04gcGF0aC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIEdldENvbnRhaW5lckRvd25sb2Fkc0xpc3RQYXRoKGNvbnRhaW5lck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLlN0b3JhZ2VBY2NvdW50VGVtcFBhdGgsIGNvbnRhaW5lck5hbWUsIFwiZG93bmxvYWRzLWxpc3QuanNvblwiKTtcclxuICAgIH1cclxuICAgIC8vICNlbmRyZWdpb24gVGVtcG9yYXJ5IGRhdGEgcGF0aHNcclxuXHJcbiAgICAvLyAjcmVnaW9uIERhdGEgb3V0cHV0IHBhdGhzXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZXMgY29udGFpbmVyIGRvd25sb2FkcyBkZXN0aW5hdGlvbiBwYXRoLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgR2V0Q29udGFpbmVyRG93bmxvYWRzRGVzdGluYXRpb25QYXRoKGNvbnRhaW5lck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLmNvbmZpZy5vdXREaXIsIHRoaXMuY29uZmlnLnN0b3JhZ2VBY2NvdW50LCBjb250YWluZXJOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBkb3dubG9hZGVkIGJsb2IgZGVzdGluYXRpb24gcGF0aC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIEdldENvbnRhaW5lckJsb2JEb3dubG9hZFBhdGgoY29udGFpbmVyTmFtZTogc3RyaW5nLCBibG9iTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuR2V0Q29udGFpbmVyRG93bmxvYWRzRGVzdGluYXRpb25QYXRoKGNvbnRhaW5lck5hbWUpLCBibG9iTmFtZSk7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb24gRGF0YSBvdXRwdXQgcGF0aHNcclxuXHJcbiAgICAvLyAjcmVnaW9uIExvZ2dpbmdcclxuICAgIHByaXZhdGUgb3V0cHV0RG93bmxvYWRzTGlzdE5vdGlmaWNhdGlvbihkb3dubG9hZHNMaXN0TGVuZ3RoOiBudW1iZXIsIGNvbnRhaW5lck5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChkb3dubG9hZHNMaXN0TGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLkRlYnVnKGBBbGwgXCIke2NvbnRhaW5lck5hbWV9XCIgYmxvYnMgZnJvbSBBenVyZSBzdG9yYWdlIGFjY291bnQgYCArXHJcbiAgICAgICAgICAgICAgICBgXCIke3RoaXMuY29uZmlnLnN0b3JhZ2VBY2NvdW50fVwiIGFyZSBzdG9yZWQgbG9jYWxseS5gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5XYXJuKGBGb3VuZCAke2Rvd25sb2Fkc0xpc3RMZW5ndGh9IGJsb2JzIG1pc3NpbmcgaW4gXCIke2NvbnRhaW5lck5hbWV9XCJgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uIExvZ2dpbmdcclxuXHJcbiAgICAvLyAjcmVnaW9uIFByb21pc2UgaGFuZGxlcnNcclxuICAgIHByaXZhdGUgZG93bmxvYWRCbG9ic0hhbmRsZXI6IFByb21pc2VIYW5kbGVyPEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHQsIEJsb2JEb3dubG9hZER0bywgQmxvYkNvbnRleHQgfCB1bmRlZmluZWQ+ID1cclxuICAgICAgICBhc3luYyAoYmxvYlJlc3VsdCwgY29udGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb250ZXh0IGlzIGRlZmluZWQgaW4gRG93bmxvYWRDb250YWluZXJCbG9ic1xyXG4gICAgICAgICAgICBjb25zdCBjb250YWluZXJOYW1lID0gY29udGV4dCEuQ29udGFpbmVyTmFtZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJsb2JEZXN0aW5hdGlvblBhdGggPSB0aGlzLkdldENvbnRhaW5lckJsb2JEb3dubG9hZFBhdGgoY29udGFpbmVyTmFtZSwgYmxvYlJlc3VsdC5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwYXRoLmRpcm5hbWUoYmxvYkRlc3RpbmF0aW9uUGF0aCkpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShibG9iRGVzdGluYXRpb25QYXRoKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5EZWJ1ZyhgRG93bmxvYWRpbmcgXCIke2Jsb2JSZXN1bHQubmFtZX1cIiBmcm9tIFwiJHtjb250YWluZXJOYW1lfVwiLmApO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkZWRCbG9iID0gYXdhaXQgR2V0QmxvYlRvU3RyZWFtKHRoaXMuYmxvYlNlcnZpY2UsIGNvbnRhaW5lck5hbWUsIGJsb2JSZXN1bHQubmFtZSwgd3JpdGVTdHJlYW0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2JDb250ZW50TGVuZ3RoID0gTnVtYmVyKGJsb2JSZXN1bHQuY29udGVudExlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShibG9iQ29udGVudExlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJsb2IgXCIke2Jsb2JSZXN1bHQubmFtZX1cIiBmcm9tIFwiJHtjb250YWluZXJOYW1lfVwiIGNvbnRlbnQgbGVuZ3RoIGlzIG5vdCBhIGZpbml0ZSBudW1iZXIuYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGJsb2JDb250ZW50TGVuZ3RoID09PSBkb3dubG9hZGVkQmxvYi5Mb2NhbENvbnRlbnRMZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5EZWJ1ZyhgQ29udGFpbmVyJ3MgXCIke2NvbnRhaW5lck5hbWV9XCIgYmxvYiBcIiR7YmxvYlJlc3VsdC5uYW1lfVwiIHN1Y2Nlc3NmdWxseSBkb3dubG9hZGVkLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRlU3RyZWFtLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvd25sb2FkZWRCbG9iO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJsb2IgXCIke2Jsb2JSZXN1bHQubmFtZX1cIiBjb250ZW50IGxlbmd0aCBpbiBBenVyZSAoJHtibG9iQ29udGVudExlbmd0aH0pYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBhbmQgbG9jYWxseSAoJHtkb3dubG9hZGVkQmxvYi5Mb2NhbENvbnRlbnRMZW5ndGh9KSBhcmUgZGlmZmVyZW50LmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuRXJyb3IoYEZhaWxlZCB0byBkb3dubG9hZCBcIiR7YmxvYlJlc3VsdC5uYW1lfVwiIGZyb20gXCIke2NvbnRhaW5lck5hbWV9XCJgKTtcclxuICAgICAgICAgICAgICAgIHdyaXRlU3RyZWFtLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJsb2JzTGlzdEZldGNoSGFuZGxlcjogUHJvbWlzZUhhbmRsZXI8QmxvYlNlcnZpY2UuQ29udGFpbmVyUmVzdWx0LCBCbG9iU2VydmljZS5CbG9iUmVzdWx0W10+ID0gYXN5bmMgY29udGFpbmVyUmVzdWx0ID0+IHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5GZXRjaENvbnRhaW5lckJsb2JzTGlzdChjb250YWluZXJSZXN1bHQubmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uIFByb21pc2UgaGFuZGxlcnNcclxufVxyXG4iXX0=