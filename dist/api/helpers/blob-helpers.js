"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var fast_glob_1 = require("fast-glob");
/**
 * Constructs host of Azure storage account.
 */
function ConstructHost(storageAccount) {
    return "https://" + storageAccount + ".blob.core.windows.net";
}
exports.ConstructHost = ConstructHost;
/**
 * Retrieves Azure Storage service properties.
 */
function GetServiceProperties(blobService, options) {
    if (options === void 0) { options = {}; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    blobService.getServiceProperties(options, function (error, result, response) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve({
                                Result: result,
                                ServiceResponse: response
                            });
                        }
                    });
                })];
        });
    });
}
exports.GetServiceProperties = GetServiceProperties;
/**
 * Retrieves containers list of an Azure Storage account.
 */
function GetContainersList(blobService, continuationToken, options) {
    if (options === void 0) { options = {}; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    // TODO: remove `as common.ContinuationToken` when `azure-storage` updated.
                    blobService.listContainersSegmented(continuationToken, options, function (error, results) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(results);
                        }
                    });
                })];
        });
    });
}
exports.GetContainersList = GetContainersList;
/**
 * Retrieves container's blobs list.
 */
function GetBlobsList(blobService, containerName, continuationToken, options) {
    if (options === void 0) { options = {}; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    // TODO: remove `as common.ContinuationToken` when `azure-storage` updated.
                    blobService.listBlobsSegmented(containerName, continuationToken, options, function (error, results) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(results);
                        }
                    });
                })];
        });
    });
}
exports.GetBlobsList = GetBlobsList;
/**
 * Downloads blob to a file.
 */
function GetBlobToLocalFile(blobService, containerName, blobName, localFileName, options) {
    if (localFileName === void 0) { localFileName = path.join(process.cwd(), blobName); }
    if (options === void 0) { options = {}; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    blobService.getBlobToLocalFile(containerName, blobName, localFileName, function (error, blobResult, serviceResponse) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve({
                                Result: blobResult,
                                ServiceResponse: serviceResponse
                            });
                        }
                    });
                })];
        });
    });
}
exports.GetBlobToLocalFile = GetBlobToLocalFile;
/**
 * Downloads blob to a stream.
 */
function GetBlobToStream(blobService, containerName, blobName, writeStream, options) {
    if (options === void 0) { options = {}; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    blobService.getBlobToStream(containerName, blobName, writeStream, options, function (error, blobResult, serviceResponse) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            var stream = writeStream;
                            resolve({
                                Result: blobResult,
                                ServiceResponse: serviceResponse,
                                LocalContentLength: stream.bytesWritten
                            });
                        }
                    });
                })];
        });
    });
}
exports.GetBlobToStream = GetBlobToStream;
/**
 * Filters in blobs that are missing in supplied list of LocalFileDto.
 * If blob file in file system is different size, it counts as missing file.
 *
 * @returns List of fs.stats objects with paths.
 */
function FilterMissingBlobsList(blobsList, localDownloadedList) {
    if (localDownloadedList.length <= 0) {
        return blobsList;
    }
    var newItems = new Array();
    var _loop_1 = function (blob) {
        var localFileIndex = localDownloadedList.findIndex(function (x) { return x.path === blob.name; });
        // Blob does not exist in local files list
        if (localFileIndex === -1) {
            newItems.push(blob);
        }
        else {
            // Blob size is not the same as downloaded local file
            var localFilePath = localDownloadedList[localFileIndex];
            var blobContentLength = Number(blob.contentLength);
            if (!isFinite(blobContentLength)) {
                console.warn("\"" + blob.name + "\" 'contentLength': " + blob.contentLength + " is not a finite number.");
                return "continue";
            }
            if (localFilePath.size !== blobContentLength) {
                newItems.push(blob);
            }
        }
    };
    try {
        for (var blobsList_1 = tslib_1.__values(blobsList), blobsList_1_1 = blobsList_1.next(); !blobsList_1_1.done; blobsList_1_1 = blobsList_1.next()) {
            var blob = blobsList_1_1.value;
            _loop_1(blob);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (blobsList_1_1 && !blobsList_1_1.done && (_a = blobsList_1.return)) _a.call(blobsList_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return newItems;
    var e_1, _a;
}
exports.FilterMissingBlobsList = FilterMissingBlobsList;
/**
 * Retrieves a local files list (fs.stats objects with paths) using glob patterns.
 *
 * @param containerSourcePath Path to container blobs.
 * @returns Local files list (fs.stats objects with paths).
 */
function GetLocalFilesList(containerSourcePath, pattern) {
    if (pattern === void 0) { pattern = ["**/*"]; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = {
                        cwd: containerSourcePath,
                        stats: true,
                        onlyFiles: true
                    };
                    return [4 /*yield*/, fast_glob_1.default(pattern, options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.GetLocalFilesList = GetLocalFilesList;
/**
 * Retrieves directories list of source path using glob pattern.
 */
function GetLocalDirectoriesList(sourcePath, pattern) {
    if (pattern === void 0) { pattern = ["*"]; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = {
                        cwd: sourcePath,
                        onlyDirs: true
                    };
                    return [4 /*yield*/, fast_glob_1.default(pattern, options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.GetLocalDirectoriesList = GetLocalDirectoriesList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvYi1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9oZWxwZXJzL2Jsb2ItaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBNkI7QUFDN0IsdUNBQStDO0FBSy9DOztHQUVHO0FBQ0gsdUJBQThCLGNBQXNCO0lBQ2hELE1BQU0sQ0FBQyxhQUFXLGNBQWMsMkJBQXdCLENBQUM7QUFDN0QsQ0FBQztBQUZELHNDQUVDO0FBRUQ7O0dBRUc7QUFDSCw4QkFBMkMsV0FBd0IsRUFBRSxPQUFtQztJQUFuQyx3QkFBQSxFQUFBLFlBQW1DOzs7WUFDcEcsc0JBQU8sSUFBSSxPQUFPLENBQXVCLFVBQUMsT0FBTyxFQUFFLE1BQU07b0JBQ3JELFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVE7d0JBQzlELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNsQixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLE9BQU8sQ0FBQztnQ0FDSixNQUFNLEVBQUUsTUFBTTtnQ0FDZCxlQUFlLEVBQUUsUUFBUTs2QkFDNUIsQ0FBQyxDQUFDO3dCQUNQLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLEVBQUM7OztDQUNOO0FBYkQsb0RBYUM7QUFFRDs7R0FFRztBQUNILDJCQUNJLFdBQXdCLEVBQ3hCLGlCQUE0QyxFQUM1QyxPQUE4QztJQUE5Qyx3QkFBQSxFQUFBLFlBQThDOzs7WUFFOUMsc0JBQU8sSUFBSSxPQUFPLENBQWtDLFVBQUMsT0FBTyxFQUFFLE1BQU07b0JBQ2hFLDJFQUEyRTtvQkFDM0UsV0FBVyxDQUFDLHVCQUF1QixDQUMvQixpQkFBNkMsRUFDN0MsT0FBTyxFQUNQLFVBQUMsS0FBSyxFQUFFLE9BQU87d0JB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QUEsU0FBUyxDQUFBLG9DQUFBO1lBQXZCLElBQU0sSUFBSSxzQkFBQTtvQkFBSixJQUFJO1NBbUJkOzs7Ozs7Ozs7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUNwQixDQUFDO0FBNUJELHdEQTRCQztBQUVEOzs7OztHQUtHO0FBQ0gsMkJBQXdDLG1CQUEyQixFQUFFLE9BQTRCO0lBQTVCLHdCQUFBLEVBQUEsV0FBcUIsTUFBTSxDQUFDOzs7Ozs7b0JBQ3ZGLE9BQU8sR0FBYTt3QkFDdEIsR0FBRyxFQUFFLG1CQUFtQjt3QkFDeEIsS0FBSyxFQUFFLElBQUk7d0JBQ1gsU0FBUyxFQUFFLElBQUk7cUJBQ2xCLENBQUM7b0JBRUsscUJBQU0sbUJBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUE7d0JBQXZDLHNCQUFPLFNBQWdDLEVBQUM7Ozs7Q0FDM0M7QUFSRCw4Q0FRQztBQUVEOztHQUVHO0FBQ0gsaUNBQThDLFVBQWtCLEVBQUUsT0FBeUI7SUFBekIsd0JBQUEsRUFBQSxXQUFxQixHQUFHLENBQUM7Ozs7OztvQkFDakYsT0FBTyxHQUFhO3dCQUN0QixHQUFHLEVBQUUsVUFBVTt3QkFDZixRQUFRLEVBQUUsSUFBSTtxQkFDakIsQ0FBQztvQkFFSyxxQkFBTSxtQkFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBQTt3QkFBdkMsc0JBQU8sU0FBZ0MsRUFBQzs7OztDQUMzQztBQVBELDBEQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgZmFzdEdsb2IsIHsgSU9wdGlvbnMgfSBmcm9tIFwiZmFzdC1nbG9iXCI7XHJcbmltcG9ydCB7IEJsb2JTZXJ2aWNlLCBjb21tb24gfSBmcm9tIFwiYXp1cmUtc3RvcmFnZVwiO1xyXG5pbXBvcnQgeyBXcml0YWJsZSB9IGZyb20gXCJzdHJlYW1cIjtcclxuaW1wb3J0IHsgQmxvYkRvd25sb2FkRHRvLCBTZXJ2aWNlUHJvcGVydGllc0R0byB9IGZyb20gXCIuLi9jb250cmFjdHMvYmxvYi1oZWxwZXJzLWNvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBMb2NhbEZpbGVEdG8gfSBmcm9tIFwiLi4vLi4vY2xpL2NsaS1jb250cmFjdHNcIjtcclxuLyoqXHJcbiAqIENvbnN0cnVjdHMgaG9zdCBvZiBBenVyZSBzdG9yYWdlIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQ29uc3RydWN0SG9zdChzdG9yYWdlQWNjb3VudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgaHR0cHM6Ly8ke3N0b3JhZ2VBY2NvdW50fS5ibG9iLmNvcmUud2luZG93cy5uZXRgO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIEF6dXJlIFN0b3JhZ2Ugc2VydmljZSBwcm9wZXJ0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdldFNlcnZpY2VQcm9wZXJ0aWVzKGJsb2JTZXJ2aWNlOiBCbG9iU2VydmljZSwgb3B0aW9uczogY29tbW9uLlJlcXVlc3RPcHRpb25zID0ge30pOiBQcm9taXNlPFNlcnZpY2VQcm9wZXJ0aWVzRHRvPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8U2VydmljZVByb3BlcnRpZXNEdG8+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBibG9iU2VydmljZS5nZXRTZXJ2aWNlUHJvcGVydGllcyhvcHRpb25zLCAoZXJyb3IsIHJlc3VsdCwgcmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVzdWx0OiByZXN1bHQsXHJcbiAgICAgICAgICAgICAgICAgICAgU2VydmljZVJlc3BvbnNlOiByZXNwb25zZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIGNvbnRhaW5lcnMgbGlzdCBvZiBhbiBBenVyZSBTdG9yYWdlIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR2V0Q29udGFpbmVyc0xpc3QoXHJcbiAgICBibG9iU2VydmljZTogQmxvYlNlcnZpY2UsXHJcbiAgICBjb250aW51YXRpb25Ub2tlbj86IGNvbW1vbi5Db250aW51YXRpb25Ub2tlbixcclxuICAgIG9wdGlvbnM6IEJsb2JTZXJ2aWNlLkxpc3RDb250YWluZXJPcHRpb25zID0ge31cclxuKTogUHJvbWlzZTxCbG9iU2VydmljZS5MaXN0Q29udGFpbmVyUmVzdWx0PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8QmxvYlNlcnZpY2UuTGlzdENvbnRhaW5lclJlc3VsdD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBgYXMgY29tbW9uLkNvbnRpbnVhdGlvblRva2VuYCB3aGVuIGBhenVyZS1zdG9yYWdlYCB1cGRhdGVkLlxyXG4gICAgICAgIGJsb2JTZXJ2aWNlLmxpc3RDb250YWluZXJzU2VnbWVudGVkKFxyXG4gICAgICAgICAgICBjb250aW51YXRpb25Ub2tlbiBhcyBjb21tb24uQ29udGludWF0aW9uVG9rZW4sXHJcbiAgICAgICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgICAgIChlcnJvciwgcmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHJpZXZlcyBjb250YWluZXIncyBibG9icyBsaXN0LlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdldEJsb2JzTGlzdChcclxuICAgIGJsb2JTZXJ2aWNlOiBCbG9iU2VydmljZSxcclxuICAgIGNvbnRhaW5lck5hbWU6IHN0cmluZyxcclxuICAgIGNvbnRpbnVhdGlvblRva2VuPzogY29tbW9uLkNvbnRpbnVhdGlvblRva2VuLFxyXG4gICAgb3B0aW9uczogQmxvYlNlcnZpY2UuTGlzdENvbnRhaW5lck9wdGlvbnMgPSB7fVxyXG4pOiBQcm9taXNlPEJsb2JTZXJ2aWNlLkxpc3RCbG9ic1Jlc3VsdD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEJsb2JTZXJ2aWNlLkxpc3RCbG9ic1Jlc3VsdD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBgYXMgY29tbW9uLkNvbnRpbnVhdGlvblRva2VuYCB3aGVuIGBhenVyZS1zdG9yYWdlYCB1cGRhdGVkLlxyXG4gICAgICAgIGJsb2JTZXJ2aWNlLmxpc3RCbG9ic1NlZ21lbnRlZChcclxuICAgICAgICAgICAgY29udGFpbmVyTmFtZSxcclxuICAgICAgICAgICAgY29udGludWF0aW9uVG9rZW4gYXMgY29tbW9uLkNvbnRpbnVhdGlvblRva2VuLFxyXG4gICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICAoZXJyb3IsIHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEb3dubG9hZHMgYmxvYiB0byBhIGZpbGUuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR2V0QmxvYlRvTG9jYWxGaWxlKFxyXG4gICAgYmxvYlNlcnZpY2U6IEJsb2JTZXJ2aWNlLFxyXG4gICAgY29udGFpbmVyTmFtZTogc3RyaW5nLFxyXG4gICAgYmxvYk5hbWU6IHN0cmluZyxcclxuICAgIGxvY2FsRmlsZU5hbWU6IHN0cmluZyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBibG9iTmFtZSksXHJcbiAgICBvcHRpb25zOiBCbG9iU2VydmljZS5HZXRCbG9iUmVxdWVzdE9wdGlvbnMgPSB7fVxyXG4pOiBQcm9taXNlPEJsb2JEb3dubG9hZER0bz4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEJsb2JEb3dubG9hZER0bz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGJsb2JTZXJ2aWNlLmdldEJsb2JUb0xvY2FsRmlsZShjb250YWluZXJOYW1lLCBibG9iTmFtZSwgbG9jYWxGaWxlTmFtZSwgKGVycm9yLCBibG9iUmVzdWx0LCBzZXJ2aWNlUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVzdWx0OiBibG9iUmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgICAgIFNlcnZpY2VSZXNwb25zZTogc2VydmljZVJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEb3dubG9hZHMgYmxvYiB0byBhIHN0cmVhbS5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHZXRCbG9iVG9TdHJlYW0oXHJcbiAgICBibG9iU2VydmljZTogQmxvYlNlcnZpY2UsXHJcbiAgICBjb250YWluZXJOYW1lOiBzdHJpbmcsXHJcbiAgICBibG9iTmFtZTogc3RyaW5nLFxyXG4gICAgd3JpdGVTdHJlYW06IFdyaXRhYmxlLFxyXG4gICAgb3B0aW9uczogQmxvYlNlcnZpY2UuR2V0QmxvYlJlcXVlc3RPcHRpb25zID0ge31cclxuKTogUHJvbWlzZTxCbG9iRG93bmxvYWREdG8+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxCbG9iRG93bmxvYWREdG8+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBibG9iU2VydmljZS5nZXRCbG9iVG9TdHJlYW0oXHJcbiAgICAgICAgICAgIGNvbnRhaW5lck5hbWUsXHJcbiAgICAgICAgICAgIGJsb2JOYW1lLFxyXG4gICAgICAgICAgICB3cml0ZVN0cmVhbSxcclxuICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICAgICAgKGVycm9yLCBibG9iUmVzdWx0LCBzZXJ2aWNlUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbSA9IHdyaXRlU3RyZWFtIGFzIFdyaXRhYmxlICYgeyBieXRlc1dyaXR0ZW46IG51bWJlciB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZXN1bHQ6IGJsb2JSZXN1bHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFNlcnZpY2VSZXNwb25zZTogc2VydmljZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBMb2NhbENvbnRlbnRMZW5ndGg6IHN0cmVhbS5ieXRlc1dyaXR0ZW5cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpbHRlcnMgaW4gYmxvYnMgdGhhdCBhcmUgbWlzc2luZyBpbiBzdXBwbGllZCBsaXN0IG9mIExvY2FsRmlsZUR0by5cclxuICogSWYgYmxvYiBmaWxlIGluIGZpbGUgc3lzdGVtIGlzIGRpZmZlcmVudCBzaXplLCBpdCBjb3VudHMgYXMgbWlzc2luZyBmaWxlLlxyXG4gKlxyXG4gKiBAcmV0dXJucyBMaXN0IG9mIGZzLnN0YXRzIG9iamVjdHMgd2l0aCBwYXRocy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBGaWx0ZXJNaXNzaW5nQmxvYnNMaXN0KGJsb2JzTGlzdDogQmxvYlNlcnZpY2UuQmxvYlJlc3VsdFtdLCBsb2NhbERvd25sb2FkZWRMaXN0OiBMb2NhbEZpbGVEdG9bXSk6IEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHRbXSB7XHJcbiAgICBpZiAobG9jYWxEb3dubG9hZGVkTGlzdC5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgIHJldHVybiBibG9ic0xpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3SXRlbXM6IEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHRbXSA9IG5ldyBBcnJheTxCbG9iU2VydmljZS5CbG9iUmVzdWx0PigpO1xyXG4gICAgZm9yIChjb25zdCBibG9iIG9mIGJsb2JzTGlzdCkge1xyXG4gICAgICAgIGNvbnN0IGxvY2FsRmlsZUluZGV4ID0gbG9jYWxEb3dubG9hZGVkTGlzdC5maW5kSW5kZXgoeCA9PiB4LnBhdGggPT09IGJsb2IubmFtZSk7XHJcbiAgICAgICAgLy8gQmxvYiBkb2VzIG5vdCBleGlzdCBpbiBsb2NhbCBmaWxlcyBsaXN0XHJcbiAgICAgICAgaWYgKGxvY2FsRmlsZUluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICBuZXdJdGVtcy5wdXNoKGJsb2IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEJsb2Igc2l6ZSBpcyBub3QgdGhlIHNhbWUgYXMgZG93bmxvYWRlZCBsb2NhbCBmaWxlXHJcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsRmlsZVBhdGggPSBsb2NhbERvd25sb2FkZWRMaXN0W2xvY2FsRmlsZUluZGV4XTtcclxuICAgICAgICAgICAgY29uc3QgYmxvYkNvbnRlbnRMZW5ndGggPSBOdW1iZXIoYmxvYi5jb250ZW50TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghaXNGaW5pdGUoYmxvYkNvbnRlbnRMZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFwiJHtibG9iLm5hbWV9XCIgJ2NvbnRlbnRMZW5ndGgnOiAke2Jsb2IuY29udGVudExlbmd0aH0gaXMgbm90IGEgZmluaXRlIG51bWJlci5gKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobG9jYWxGaWxlUGF0aC5zaXplICE9PSBibG9iQ29udGVudExlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbmV3SXRlbXMucHVzaChibG9iKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3SXRlbXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbCBmaWxlcyBsaXN0IChmcy5zdGF0cyBvYmplY3RzIHdpdGggcGF0aHMpIHVzaW5nIGdsb2IgcGF0dGVybnMuXHJcbiAqXHJcbiAqIEBwYXJhbSBjb250YWluZXJTb3VyY2VQYXRoIFBhdGggdG8gY29udGFpbmVyIGJsb2JzLlxyXG4gKiBAcmV0dXJucyBMb2NhbCBmaWxlcyBsaXN0IChmcy5zdGF0cyBvYmplY3RzIHdpdGggcGF0aHMpLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdldExvY2FsRmlsZXNMaXN0KGNvbnRhaW5lclNvdXJjZVBhdGg6IHN0cmluZywgcGF0dGVybjogc3RyaW5nW10gPSBbXCIqKi8qXCJdKTogUHJvbWlzZTxMb2NhbEZpbGVEdG9bXT4ge1xyXG4gICAgY29uc3Qgb3B0aW9uczogSU9wdGlvbnMgPSB7XHJcbiAgICAgICAgY3dkOiBjb250YWluZXJTb3VyY2VQYXRoLFxyXG4gICAgICAgIHN0YXRzOiB0cnVlLFxyXG4gICAgICAgIG9ubHlGaWxlczogdHJ1ZVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gYXdhaXQgZmFzdEdsb2IocGF0dGVybiwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgZGlyZWN0b3JpZXMgbGlzdCBvZiBzb3VyY2UgcGF0aCB1c2luZyBnbG9iIHBhdHRlcm4uXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR2V0TG9jYWxEaXJlY3Rvcmllc0xpc3Qoc291cmNlUGF0aDogc3RyaW5nLCBwYXR0ZXJuOiBzdHJpbmdbXSA9IFtcIipcIl0pOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcbiAgICBjb25zdCBvcHRpb25zOiBJT3B0aW9ucyA9IHtcclxuICAgICAgICBjd2Q6IHNvdXJjZVBhdGgsXHJcbiAgICAgICAgb25seURpcnM6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGF3YWl0IGZhc3RHbG9iKHBhdHRlcm4sIG9wdGlvbnMpO1xyXG59XHJcbiJdfQ==