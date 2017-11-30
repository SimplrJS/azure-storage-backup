"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs-extra");
var path = require("path");
var FileSize = require("filesize");
var os_1 = require("os");
// #region Package helpers
/**
 * Path from current file to a `package.json`.
 */
var PACKAGE_JSON_PATH = "../../package.json";
/**
 * Object of `package.json`.
 */
exports.PACKAGE_JSON = fs.readJSONSync(path.join(__dirname, PACKAGE_JSON_PATH));
/**
 * Get version string from `package.json`.
 */
function GetVersion() {
    return exports.PACKAGE_JSON.version;
}
exports.GetVersion = GetVersion;
// #endregion Package helpers
// #region CLI input
exports.DEFAULT_CLI_VALUES = {
    ConfigFileName: "backup.config.json",
    LogFileName: ".backup-log"
};
/**
 * Checks if a container name is a valid string.
 *
 * @param containerName Azure storage container name.
 * @returns Is supplied container is a valid string.
 */
function IsContainerNameValid(containerName) {
    return typeof containerName === "string" && containerName.length > 0;
}
exports.IsContainerNameValid = IsContainerNameValid;
// #endregion CLI input
/**
 * Reads a configuration file from defined path.
 *
 * @export
 * @param {string} configPath configuration file path.
 * @returns {ConfigData} Configuration object.
 */
function ReadConfig(configPath) {
    try {
        var configString = fs.readFileSync(configPath).toString();
        return JSON.parse(configString);
    }
    catch (error) {
        throw new Error("Failed to load config file from \"" + configPath + "\". " + os_1.EOL + " " + error);
    }
}
exports.ReadConfig = ReadConfig;
/**
 * Resolves a config path from supplied CLI argument (if provided).
 *
 * @param configPath config path provided in CLI.
 */
function ResolveConfigPath(configPath) {
    return ResolvePath(configPath, exports.DEFAULT_CLI_VALUES.ConfigFileName, "Wrong config path:");
}
exports.ResolveConfigPath = ResolveConfigPath;
/**
 * Resolves a log path from supplied configuration value.
 *
 * @param logPath Log path provided in config (optional).
 */
function ResolveLogPath(logPath) {
    return ResolvePath(logPath, exports.DEFAULT_CLI_VALUES.LogFileName, "Wrong log path:");
}
exports.ResolveLogPath = ResolveLogPath;
/**
 * Resolves config schema path.
 *
 * @returns config schema path.
 */
function ResolveConfigSchemaPath() {
    return path.resolve(__dirname, "../", exports.CONFIG_JSON_SCHEMA_FILE_NAME);
}
exports.ResolveConfigSchemaPath = ResolveConfigSchemaPath;
/**
 * Resolves configuration JSON $schema value.
 *
 * @returns $schema value.
 */
function ResolveConfigSchemaValue() {
    return "file:///" + ResolveConfigSchemaPath();
}
exports.ResolveConfigSchemaValue = ResolveConfigSchemaValue;
/**
 * Default JSON configuration schema file name.
 */
exports.CONFIG_JSON_SCHEMA_FILE_NAME = "schema.backup.config.json";
// #endregion Config helpers
// #region FS helpers
/**
 * Processes supplied path to a valid path.
 */
function ResolvePath(suppliedPath, defaultFileName, errorMessage) {
    if (!suppliedPath) {
        return path.join(process.cwd(), defaultFileName);
    }
    if (typeof suppliedPath !== "string") {
        throw new Error(errorMessage + " \"" + suppliedPath + "\".");
    }
    if (path.isAbsolute(suppliedPath)) {
        return suppliedPath;
    }
    else {
        return path.join(process.cwd(), suppliedPath);
    }
}
exports.ResolvePath = ResolvePath;
// #endregion FS helpers
// #region CLI tables helpers
exports.BlobsListTableConfig = {
    head: ["Container name", "Blobs count", "Total size"],
    colWidths: [30, 15, 40]
};
/**
 * Constructs statistics table row of cli-table2.
 *
 * @template TItemType Type of items in supplied array.
 * @param containerName Azure Storage account container name.
 * @param items Items that contain blob result.
 * @param showInBytes Defines if blobs / files size should be displayed in bytes (optional, default value - false).
 * @param blobResultGetter Function that gets BlobService.BlobResult from supplied item.
 */
function ConstructStatisticsTableRow(containerName, items, showInBytes, blobResultGetter) {
    if (showInBytes === void 0) { showInBytes = false; }
    var totalSize = 0;
    try {
        for (var items_1 = tslib_1.__values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            var blobResult = blobResultGetter(item);
            var contentLength = Number(blobResult.contentLength);
            if (isFinite(contentLength)) {
                totalSize += contentLength;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var fileSize = showInBytes ? totalSize + " B" : FileSize(totalSize);
    return [containerName, items.length, fileSize];
    var e_1, _a;
}
exports.ConstructStatisticsTableRow = ConstructStatisticsTableRow;
/**
 * Default value of function that gets BlobService.BlobResult from supplied item.
 *
 * @param item BlobService.BlobResult item.
 */
exports.DefaultBlobResultGetter = function (item) { return item; };
// #endregion CLI tables helpers
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLWhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL2NsaS1oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUErQjtBQUMvQiwyQkFBNkI7QUFFN0IsbUNBQXFDO0FBQ3JDLHlCQUF5QjtBQU16QiwwQkFBMEI7QUFDMUI7O0dBRUc7QUFDSCxJQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDO0FBRS9DOztHQUVHO0FBQ1UsUUFBQSxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFnQixDQUFDO0FBRXBHOztHQUVHO0FBQ0g7SUFDSSxNQUFNLENBQUMsb0JBQVksQ0FBQyxPQUFPLENBQUM7QUFDaEMsQ0FBQztBQUZELGdDQUVDO0FBQ0QsNkJBQTZCO0FBRTdCLG9CQUFvQjtBQUNQLFFBQUEsa0JBQWtCLEdBQUc7SUFDOUIsY0FBYyxFQUFFLG9CQUFvQjtJQUNwQyxXQUFXLEVBQUUsYUFBYTtDQUM3QixDQUFDO0FBRUY7Ozs7O0dBS0c7QUFDSCw4QkFBcUMsYUFBa0I7SUFDbkQsTUFBTSxDQUFDLE9BQU8sYUFBYSxLQUFLLFFBQVEsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRkQsb0RBRUM7QUFFRCx1QkFBdUI7QUFFdkI7Ozs7OztHQU1HO0FBQ0gsb0JBQTJCLFVBQWtCO0lBQ3pDLElBQUksQ0FBQztRQUNELElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFlLENBQUM7SUFDbEQsQ0FBQztJQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDYixNQUFNLElBQUksS0FBSyxDQUFDLHVD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LENBQUMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFDbkQsQ0FBQztBQWxCRCxrRUFrQkM7QUFFRDs7OztHQUlHO0FBQ1UsUUFBQSx1QkFBdUIsR0FBNkMsVUFBQyxJQUE0QixJQUFLLE9BQUEsSUFBSSxFQUFKLENBQUksQ0FBQztBQUN4SCxnQ0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgKiBhcyBUYWJsZSBmcm9tIFwiY2xpLXRhYmxlMlwiO1xyXG5pbXBvcnQgKiBhcyBGaWxlU2l6ZSBmcm9tIFwiZmlsZXNpemVcIjtcclxuaW1wb3J0IHsgRU9MIH0gZnJvbSBcIm9zXCI7XHJcbmltcG9ydCB7IEJsb2JTZXJ2aWNlIH0gZnJvbSBcImF6dXJlLXN0b3JhZ2VcIjtcclxuXHJcbmltcG9ydCB7IEJhc2VQYWNrYWdlLCBCbG9iUmVzdWx0R2V0dGVyIH0gZnJvbSBcIi4vY2xpLWNvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBDb25maWdEYXRhIH0gZnJvbSBcIi4uL2FwaS9tYW5hZ2Vycy9zdG9yYWdlLWFjY291bnQvc3RvcmFnZS1hY2NvdW50LWNvbnRyYWN0c1wiO1xyXG5cclxuLy8gI3JlZ2lvbiBQYWNrYWdlIGhlbHBlcnNcclxuLyoqXHJcbiAqIFBhdGggZnJvbSBjdXJyZW50IGZpbGUgdG8gYSBgcGFja2FnZS5qc29uYC5cclxuICovXHJcbmNvbnN0IFBBQ0tBR0VfSlNPTl9QQVRIID0gXCIuLi8uLi9wYWNrYWdlLmpzb25cIjtcclxuXHJcbi8qKlxyXG4gKiBPYmplY3Qgb2YgYHBhY2thZ2UuanNvbmAuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgUEFDS0FHRV9KU09OID0gZnMucmVhZEpTT05TeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsIFBBQ0tBR0VfSlNPTl9QQVRIKSkgYXMgQmFzZVBhY2thZ2U7XHJcblxyXG4vKipcclxuICogR2V0IHZlcnNpb24gc3RyaW5nIGZyb20gYHBhY2thZ2UuanNvbmAuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gR2V0VmVyc2lvbigpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFBBQ0tBR0VfSlNPTi52ZXJzaW9uO1xyXG59XHJcbi8vICNlbmRyZWdpb24gUGFja2FnZSBoZWxwZXJzXHJcblxyXG4vLyAjcmVnaW9uIENMSSBpbnB1dFxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9DTElfVkFMVUVTID0ge1xyXG4gICAgQ29uZmlnRmlsZU5hbWU6IFwiYmFja3VwLmNvbmZpZy5qc29uXCIsXHJcbiAgICBMb2dGaWxlTmFtZTogXCIuYmFja3VwLWxvZ1wiXHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgY29udGFpbmVyIG5hbWUgaXMgYSB2YWxpZCBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBjb250YWluZXJOYW1lIEF6dXJlIHN0b3JhZ2UgY29udGFpbmVyIG5hbWUuXHJcbiAqIEByZXR1cm5zIElzIHN1cHBsaWVkIGNvbnRhaW5lciBpcyBhIHZhbGlkIHN0cmluZy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBJc0NvbnRhaW5lck5hbWVWYWxpZChjb250YWluZXJOYW1lOiBhbnkpOiBjb250YWluZXJOYW1lIGlzIHN0cmluZyB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGNvbnRhaW5lck5hbWUgPT09IFwic3RyaW5nXCIgJiYgY29udGFpbmVyTmFtZS5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vLyAjZW5kcmVnaW9uIENMSSBpbnB1dFxyXG5cclxuLyoqXHJcbiAqIFJlYWRzIGEgY29uZmlndXJhdGlvbiBmaWxlIGZyb20gZGVmaW5lZCBwYXRoLlxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWdQYXRoIGNvbmZpZ3VyYXRpb24gZmlsZSBwYXRoLlxyXG4gKiBAcmV0dXJucyB7Q29uZmlnRGF0YX0gQ29uZmlndXJhdGlvbiBvYmplY3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUmVhZENvbmZpZyhjb25maWdQYXRoOiBzdHJpbmcpOiBDb25maWdEYXRhIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29uZmlnU3RyaW5nKSBhcyBDb25maWdEYXRhO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIGNvbmZpZyBmaWxlIGZyb20gXFxcIiR7Y29uZmlnUGF0aH1cXFwiLiAke0VPTH0gJHtlcnJvcn1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc29sdmVzIGEgY29uZmlnIHBhdGggZnJvbSBzdXBwbGllZCBDTEkgYXJndW1lbnQgKGlmIHByb3ZpZGVkKS5cclxuICpcclxuICogQHBhcmFtIGNvbmZpZ1BhdGggY29uZmlnIHBhdGggcHJvdmlkZWQgaW4gQ0xJLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFJlc29sdmVDb25maWdQYXRoKGNvbmZpZ1BhdGg6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFJlc29sdmVQYXRoKGNvbmZpZ1BhdGgsIERFRkFVTFRfQ0xJX1ZBTFVFUy5Db25maWdGaWxlTmFtZSwgXCJXcm9uZyBjb25maWcgcGF0aDpcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXNvbHZlcyBhIGxvZyBwYXRoIGZyb20gc3VwcGxpZWQgY29uZmlndXJhdGlvbiB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIGxvZ1BhdGggTG9nIHBhdGggcHJvdmlkZWQgaW4gY29uZmlnIChvcHRpb25hbCkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUmVzb2x2ZUxvZ1BhdGgobG9nUGF0aD86IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFJlc29sdmVQYXRoKGxvZ1BhdGgsIERFRkFVTFRfQ0xJX1ZBTFVFUy5Mb2dGaWxlTmFtZSwgXCJXcm9uZyBsb2cgcGF0aDpcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXNvbHZlcyBjb25maWcgc2NoZW1hIHBhdGguXHJcbiAqXHJcbiAqIEByZXR1cm5zIGNvbmZpZyBzY2hlbWEgcGF0aC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBSZXNvbHZlQ29uZmlnU2NoZW1hUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vXCIsIENPTkZJR19KU09OX1NDSEVNQV9GSUxFX05BTUUpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVzb2x2ZXMgY29uZmlndXJhdGlvbiBKU09OICRzY2hlbWEgdmFsdWUuXHJcbiAqXHJcbiAqIEByZXR1cm5zICRzY2hlbWEgdmFsdWUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUmVzb2x2ZUNvbmZpZ1NjaGVtYVZhbHVlKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYGZpbGU6Ly8vJHtSZXNvbHZlQ29uZmlnU2NoZW1hUGF0aCgpfWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IEpTT04gY29uZmlndXJhdGlvbiBzY2hlbWEgZmlsZSBuYW1lLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENPTkZJR19KU09OX1NDSEVNQV9GSUxFX05BTUUgPSBcInNjaGVtYS5iYWNrdXAuY29uZmlnLmpzb25cIjtcclxuXHJcbi8vICNlbmRyZWdpb24gQ29uZmlnIGhlbHBlcnNcclxuXHJcbi8vICNyZWdpb24gRlMgaGVscGVyc1xyXG4vKipcclxuICogUHJvY2Vzc2VzIHN1cHBsaWVkIHBhdGggdG8gYSB2YWxpZCBwYXRoLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFJlc29sdmVQYXRoKHN1cHBsaWVkUGF0aDogc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCwgZGVmYXVsdEZpbGVOYW1lOiBzdHJpbmcsIGVycm9yTWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3VwcGxpZWRQYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBkZWZhdWx0RmlsZU5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2Ygc3VwcGxpZWRQYXRoICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2Vycm9yTWVzc2FnZX0gXCIke3N1cHBsaWVkUGF0aH1cIi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGF0aC5pc0Fic29sdXRlKHN1cHBsaWVkUGF0aCkpIHtcclxuICAgICAgICByZXR1cm4gc3VwcGxpZWRQYXRoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIHN1cHBsaWVkUGF0aCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vICNlbmRyZWdpb24gRlMgaGVscGVyc1xyXG5cclxuLy8gI3JlZ2lvbiBDTEkgdGFibGVzIGhlbHBlcnNcclxuZXhwb3J0IGNvbnN0IEJsb2JzTGlzdFRhYmxlQ29uZmlnOiBUYWJsZS5UYWJsZUNvbnN0cnVjdG9yT3B0aW9ucyA9IHtcclxuICAgIGhlYWQ6IFtcIkNvbnRhaW5lciBuYW1lXCIsIFwiQmxvYnMgY291bnRcIiwgXCJUb3RhbCBzaXplXCJdLFxyXG4gICAgY29sV2lkdGhzOiBbMzAsIDE1LCA0MF1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RzIHN0YXRpc3RpY3MgdGFibGUgcm93IG9mIGNsaS10YWJsZTIuXHJcbiAqXHJcbiAqIEB0ZW1wbGF0ZSBUSXRlbVR5cGUgVHlwZSBvZiBpdGVtcyBpbiBzdXBwbGllZCBhcnJheS5cclxuICogQHBhcmFtIGNvbnRhaW5lck5hbWUgQXp1cmUgU3RvcmFnZSBhY2NvdW50IGNvbnRhaW5lciBuYW1lLlxyXG4gKiBAcGFyYW0gaXRlbXMgSXRlbXMgdGhhdCBjb250YWluIGJsb2IgcmVzdWx0LlxyXG4gKiBAcGFyYW0gc2hvd0luQnl0ZXMgRGVmaW5lcyBpZiBibG9icyAvIGZpbGVzIHNpemUgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiBieXRlcyAob3B0aW9uYWwsIGRlZmF1bHQgdmFsdWUgLSBmYWxzZSkuXHJcbiAqIEBwYXJhbSBibG9iUmVzdWx0R2V0dGVyIEZ1bmN0aW9uIHRoYXQgZ2V0cyBCbG9iU2VydmljZS5CbG9iUmVzdWx0IGZyb20gc3VwcGxpZWQgaXRlbS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBDb25zdHJ1Y3RTdGF0aXN0aWNzVGFibGVSb3c8VEl0ZW1UeXBlPihcclxuICAgIGNvbnRhaW5lck5hbWU6IHN0cmluZyxcclxuICAgIGl0ZW1zOiBUSXRlbVR5cGVbXSxcclxuICAgIHNob3dJbkJ5dGVzOiBib29sZWFuID0gZmFsc2UsXHJcbiAgICBibG9iUmVzdWx0R2V0dGVyOiBCbG9iUmVzdWx0R2V0dGVyPFRJdGVtVHlwZT5cclxuKTogVGFibGUuSG9yaXpvbnRhbFRhYmxlUm93IHtcclxuICAgIGxldCB0b3RhbFNpemUgPSAwO1xyXG5cclxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgIGNvbnN0IGJsb2JSZXN1bHQgPSBibG9iUmVzdWx0R2V0dGVyKGl0ZW0pO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnRMZW5ndGggPSBOdW1iZXIoYmxvYlJlc3VsdC5jb250ZW50TGVuZ3RoKTtcclxuICAgICAgICBpZiAoaXNGaW5pdGUoY29udGVudExlbmd0aCkpIHtcclxuICAgICAgICAgICAgdG90YWxTaXplICs9IGNvbnRlbnRMZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpbGVTaXplID0gc2hvd0luQnl0ZXMgPyBgJHt0b3RhbFNpemV9IEJgIDogRmlsZVNpemUodG90YWxTaXplKTtcclxuICAgIHJldHVybiBbY29udGFpbmVyTmFtZSwgaXRlbXMubGVuZ3RoLCBmaWxlU2l6ZV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHZhbHVlIG9mIGZ1bmN0aW9uIHRoYXQgZ2V0cyBCbG9iU2VydmljZS5CbG9iUmVzdWx0IGZyb20gc3VwcGxpZWQgaXRlbS5cclxuICpcclxuICogQHBhcmFtIGl0ZW0gQmxvYlNlcnZpY2UuQmxvYlJlc3VsdCBpdGVtLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERlZmF1bHRCbG9iUmVzdWx0R2V0dGVyOiBCbG9iUmVzdWx0R2V0dGVyPEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHQ+ID0gKGl0ZW06IEJsb2JTZXJ2aWNlLkJsb2JSZXN1bHQpID0+IGl0ZW07XHJcbi8vICNlbmRyZWdpb24gQ0xJIHRhYmxlcyBoZWxwZXJzXHJcbiJdfQ==