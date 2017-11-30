"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var inquirer_1 = require("inquirer");
var fs_extra_1 = require("fs-extra");
var cli_helpers_1 = require("../cli-helpers");
var cli_logger_1 = require("../logger/cli-logger");
var ConnectionType;
(function (ConnectionType) {
    ConnectionType["AccountNameAndKey"] = "accountNameAndKey";
    ConnectionType["ConnectionString"] = "connectionString";
})(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
/**
 * CLI command `init` class.
 *
 * Generates a configuration file.
 */
var ConfigInitializationCommandClass = /** @class */ (function () {
    function ConfigInitializationCommandClass() {
        var _this = this;
        this.command = "init";
        this.describe = "Generates a configuration file.";
        this.requireNotEmpty = function (value) {
            if (value.trim().length !== 0) {
                return true;
            }
            return "Value is empty.";
        };
        this.requirePositiveInteger = function (value) {
            var valueIsNumber = Number(value);
            if (Number.isInteger(valueIsNumber) && valueIsNumber > 0) {
                return true;
            }
            return "Value is not a positive integer.";
        };
        this.handler = function (options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var currentConfigPath, initialConfig, error_1, azureStorageQuestions, azureStorageAnswers, _a, configPath, updatedConfigValues, config, newConfigOutputPath, error_2;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentConfigPath = cli_helpers_1.ResolveConfigPath(options.config);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        cli_logger_1.CLILogger.Info("Reading config from \"" + currentConfigPath + "\".");
                        return [4 /*yield*/, fs_extra_1.readJSON(currentConfigPath)];
                    case 2:
                        initialConfig = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        initialConfig = this.defaultConfigValues;
                        return [3 /*break*/, 4];
                    case 4:
                        cli_logger_1.AddFileMessageHandler(initialConfig.logPath);
                        azureStorageQuestions = [
                            {
                                type: "input",
                                name: "storageAccount",
                                message: "Storage Account name:",
                                default: initialConfig.storageAccount || undefined,
                                validate: this.requireNotEmpty
                            },
                            {
                                type: "input",
                                name: "storageAccessKey",
                                message: "Storage Account key:",
                                default: initialConfig.storageAccessKey || undefined,
                                validate: this.requireNotEmpty
                            },
                            {
                                type: "input",
                                name: "storageHost",
                                message: "Storage host address (optional):",
                                default: initialConfig.storageHost
                            },
                            {
                                type: "input",
                                name: "outDir",
                                message: "Save downloaded files to directory:",
                                default: initialConfig.outDir,
                                validate: this.requireNotEmpty
                            },
                            {
                                type: "input",
                                name: "maxRetriesCount",
                                message: "Max retries count for failed operations:",
                                default: initialConfig.maxRetriesCount,
                                validate: this.requirePositiveInteger
                            },
                            {
                                type: "input",
                                name: "configPath",
                                message: "Save config file to directory:",
                                default: process.cwd(),
                                validate: this.requireNotEmpty
                            }
                        ];
                        return [4 /*yield*/, inquirer_1.prompt(azureStorageQuestions)];
                    case 5:
                        azureStorageAnswers = _b.sent();
                        _a = azureStorageAnswers, configPath = _a.configPath, updatedConfigValues = tslib_1.__rest(_a, ["configPath"]);
                        updatedConfigValues.storageHost = azureStorageAnswers.storageHost || undefined;
                        config = tslib_1.__assign({}, initialConfig, updatedConfigValues, { $schema: cli_helpers_1.ResolveConfigSchemaValue() });
                        newConfigOutputPath = path.join(configPath, cli_helpers_1.DEFAULT_CLI_VALUES.ConfigFileName);
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, fs_extra_1.writeJSON(newConfigOutputPath, config, { spaces: 4 })];
                    case 7:
                        _b.sent();
                        cli_logger_1.CLILogger.Info("Successfully saved config to: \"" + newConfigOutputPath + "\"");
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _b.sent();
                        cli_logger_1.CLILogger.Critical(error_2);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
    }
    Object.defineProperty(ConfigInitializationCommandClass.prototype, "defaultConfigValues", {
        get: function () {
            return {
                storageAccount: "",
                storageAccessKey: "",
                storageHost: undefined,
                outDir: process.cwd(),
                maxRetriesCount: 3,
                simultaneousDownloadsCount: 10,
                logPath: cli_helpers_1.ResolveLogPath(),
                noLogFile: false
            };
        },
        enumerable: true,
        configurable: true
    });
    return ConfigInitializationCommandClass;
}());
exports.ConfigInitializationCommandClass = ConfigInitializationCommandClass;
exports.ConfigInitializationCommand = new ConfigInitializationCommandClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tbWFuZHMtbW9kdWxlcy9pbml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUE2QjtBQUM3QixxQ0FBNkM7QUFFN0MscUNBQStDO0FBRy9DLDhDQUFpSDtBQUNqSCxtREFBd0U7QUFFeEUsSUFBWSxjQUdYO0FBSEQsV0FBWSxjQUFjO0lBQ3RCLHlEQUF1QyxDQUFBO0lBQ3ZDLHVEQUFxQyxDQUFBO0FBQ3pDLENBQUMsRUFIVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUd6QjtBQU1EOzs7O0dBSUc7QUFDSDtJQUFBO1FBQUEsaUJBK0dDO1FBOUdVLFlBQU8sR0FBVyxNQUFNLENBQUM7UUFFekIsYUFBUSxHQUFXLGlDQUFpQyxDQUFDO1FBRXBELG9CQUFlLEdBQUcsVUFBQyxLQUFhO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1FBQzdCLENBQUMsQ0FBQTtRQUVPLDJCQUFzQixHQUFHLFVBQUMsS0FBYTtZQUMzQyxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLGtDQUFrQyxDQUFDO1FBQzlDLENBQUMsQ0FBQTtRQWVNLFlBQU8sR0FBRyxVQUFPLE9BQTJCOzs7Ozt3QkFDekMsaUJBQWlCLEdBQUcsK0JBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FB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QUFTO2dCQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDckIsZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLDBCQUEwQixFQUFFLEVBQUU7Z0JBQzlCLE9BQU8sRUFBRSw0QkFBYyxFQUFFO2dCQUN6QixTQUFTLEVBQUUsS0FBSzthQUNuQixDQUFDO1FBQ04sQ0FBQzs7O09BQUE7SUFnRkwsdUNBQUM7QUFBRCxDQUFDLEFBL0dELElBK0dDO0FBL0dZLDRFQUFnQztBQWlIaEMsUUFBQSwyQkFBMkIsR0FBRyxJQUFJLGdDQUFnQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBwcm9tcHQsIFF1ZXN0aW9ucyB9IGZyb20gXCJpbnF1aXJlclwiO1xyXG5pbXBvcnQgeyBDb21tYW5kTW9kdWxlIH0gZnJvbSBcInlhcmdzXCI7XHJcbmltcG9ydCB7IHdyaXRlSlNPTiwgcmVhZEpTT04gfSBmcm9tIFwiZnMtZXh0cmFcIjtcclxuaW1wb3J0IHsgQ0xJQXJndW1lbnRzT2JqZWN0IH0gZnJvbSBcIi4uL2NsaS1jb250cmFjdHNcIjtcclxuaW1wb3J0IHsgQ29uZmlnRGF0YSB9IGZyb20gXCIuLi8uLi9hcGkvbWFuYWdlcnMvc3RvcmFnZS1hY2NvdW50L3N0b3JhZ2UtYWNjb3VudC1jb250cmFjdHNcIjtcclxuaW1wb3J0IHsgREVGQVVMVF9DTElfVkFMVUVTLCBSZXNvbHZlQ29uZmlnUGF0aCwgUmVzb2x2ZUxvZ1BhdGgsIFJlc29sdmVDb25maWdTY2hlbWFWYWx1ZSB9IGZyb20gXCIuLi9jbGktaGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDTElMb2dnZXIsIEFkZEZpbGVNZXNzYWdlSGFuZGxlciB9IGZyb20gXCIuLi9sb2dnZXIvY2xpLWxvZ2dlclwiO1xyXG5cclxuZXhwb3J0IGVudW0gQ29ubmVjdGlvblR5cGUge1xyXG4gICAgQWNjb3VudE5hbWVBbmRLZXkgPSBcImFjY291bnROYW1lQW5kS2V5XCIsXHJcbiAgICBDb25uZWN0aW9uU3RyaW5nID0gXCJjb25uZWN0aW9uU3RyaW5nXCJcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBenVyZVN0b3JhZ2VBbnN3ZXJzRHRvIGV4dGVuZHMgQ29uZmlnRGF0YSB7XHJcbiAgICBjb25maWdQYXRoOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDTEkgY29tbWFuZCBgaW5pdGAgY2xhc3MuXHJcbiAqXHJcbiAqIEdlbmVyYXRlcyBhIGNvbmZpZ3VyYXRpb24gZmlsZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25maWdJbml0aWFsaXphdGlvbkNvbW1hbmRDbGFzcyBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGUge1xyXG4gICAgcHVibGljIGNvbW1hbmQ6IHN0cmluZyA9IFwiaW5pdFwiO1xyXG5cclxuICAgIHB1YmxpYyBkZXNjcmliZTogc3RyaW5nID0gXCJHZW5lcmF0ZXMgYSBjb25maWd1cmF0aW9uIGZpbGUuXCI7XHJcblxyXG4gICAgcHJpdmF0ZSByZXF1aXJlTm90RW1wdHkgPSAodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4gfCBzdHJpbmcgPT4ge1xyXG4gICAgICAgIGlmICh2YWx1ZS50cmltKCkubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gXCJWYWx1ZSBpcyBlbXB0eS5cIjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlcXVpcmVQb3NpdGl2ZUludGVnZXIgPSAodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4gfCBzdHJpbmcgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlSXNOdW1iZXIgPSBOdW1iZXIodmFsdWUpO1xyXG4gICAgICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlSXNOdW1iZXIpICYmIHZhbHVlSXNOdW1iZXIgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gXCJWYWx1ZSBpcyBub3QgYSBwb3NpdGl2ZSBpbnRlZ2VyLlwiO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0IGRlZmF1bHRDb25maWdWYWx1ZXMoKTogQ29uZmlnRGF0YSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3RvcmFnZUFjY291bnQ6IFwiXCIsXHJcbiAgICAgICAgICAgIHN0b3JhZ2VBY2Nlc3NLZXk6IFwiXCIsXHJcbiAgICAgICAgICAgIHN0b3JhZ2VIb3N0OiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIG91dERpcjogcHJvY2Vzcy5jd2QoKSxcclxuICAgICAgICAgICAgbWF4UmV0cmllc0NvdW50OiAzLFxyXG4gICAgICAgICAgICBzaW11bHRhbmVvdXNEb3dubG9hZHNDb3VudDogMTAsXHJcbiAgICAgICAgICAgIGxvZ1BhdGg6IFJlc29sdmVMb2dQYXRoKCksXHJcbiAgICAgICAgICAgIG5vTG9nRmlsZTogZmFsc2VcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYW5kbGVyID0gYXN5bmMgKG9wdGlvbnM6IENMSUFyZ3VtZW50c09iamVjdCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb25maWdQYXRoID0gUmVzb2x2ZUNvbmZpZ1BhdGgob3B0aW9ucy5jb25maWcpO1xyXG5cclxuICAgICAgICBsZXQgaW5pdGlhbENvbmZpZzogQ29uZmlnRGF0YTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBDTElMb2dnZXIuSW5mbyhgUmVhZGluZyBjb25maWcgZnJvbSBcIiR7Y3VycmVudENvbmZpZ1BhdGh9XCIuYCk7XHJcbiAgICAgICAgICAgIGluaXRpYWxDb25maWcgPSBhd2FpdCByZWFkSlNPTihjdXJyZW50Q29uZmlnUGF0aCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgaW5pdGlhbENvbmZpZyA9IHRoaXMuZGVmYXVsdENvbmZpZ1ZhbHVlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEFkZEZpbGVNZXNzYWdlSGFuZGxlcihpbml0aWFsQ29uZmlnLmxvZ1BhdGgpO1xyXG5cclxuICAgICAgICBjb25zdCBhenVyZVN0b3JhZ2VRdWVzdGlvbnM6IFF1ZXN0aW9ucyA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbnB1dFwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJzdG9yYWdlQWNjb3VudFwiLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJTdG9yYWdlIEFjY291bnQgbmFtZTpcIixcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGluaXRpYWxDb25maWcuc3RvcmFnZUFjY291bnQgfHwgdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHRoaXMucmVxdWlyZU5vdEVtcHR5XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwic3RvcmFnZUFjY2Vzc0tleVwiLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJTdG9yYWdlIEFjY291bnQga2V5OlwiLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogaW5pdGlhbENvbmZpZy5zdG9yYWdlQWNjZXNzS2V5IHx8IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB0aGlzLnJlcXVpcmVOb3RFbXB0eVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImlucHV0XCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcInN0b3JhZ2VIb3N0XCIsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlN0b3JhZ2UgaG9zdCBhZGRyZXNzIChvcHRpb25hbCk6XCIsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBpbml0aWFsQ29uZmlnLnN0b3JhZ2VIb3N0XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwib3V0RGlyXCIsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlNhdmUgZG93bmxvYWRlZCBmaWxlcyB0byBkaXJlY3Rvcnk6XCIsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBpbml0aWFsQ29uZmlnLm91dERpcixcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB0aGlzLnJlcXVpcmVOb3RFbXB0eVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImlucHV0XCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIm1heFJldHJpZXNDb3VudFwiLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJNYXggcmV0cmllcyBjb3VudCBmb3IgZmFpbGVkIG9wZXJhdGlvbnM6XCIsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBpbml0aWFsQ29uZmlnLm1heFJldHJpZXNDb3VudCxcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB0aGlzLnJlcXVpcmVQb3NpdGl2ZUludGVnZXJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbnB1dFwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJjb25maWdQYXRoXCIsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlNhdmUgY29uZmlnIGZpbGUgdG8gZGlyZWN0b3J5OlwiLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogcHJvY2Vzcy5jd2QoKSxcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB0aGlzLnJlcXVpcmVOb3RFbXB0eVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgY29uc3QgYXp1cmVTdG9yYWdlQW5zd2VycyA9IGF3YWl0IHByb21wdChhenVyZVN0b3JhZ2VRdWVzdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHsgY29uZmlnUGF0aCwgLi4udXBkYXRlZENvbmZpZ1ZhbHVlcyB9ID0gYXp1cmVTdG9yYWdlQW5zd2VycyBhcyBBenVyZVN0b3JhZ2VBbnN3ZXJzRHRvO1xyXG5cclxuICAgICAgICB1cGRhdGVkQ29uZmlnVmFsdWVzLnN0b3JhZ2VIb3N0ID0gYXp1cmVTdG9yYWdlQW5zd2Vycy5zdG9yYWdlSG9zdCB8fCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIC8vIE1lcmdpbmcgbmV3IHZhbHVlcyB3aXRoIGV4aXN0aW5nXHJcbiAgICAgICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAuLi5pbml0aWFsQ29uZmlnLFxyXG4gICAgICAgICAgICAuLi51cGRhdGVkQ29uZmlnVmFsdWVzLFxyXG4gICAgICAgICAgICAkc2NoZW1hOiBSZXNvbHZlQ29uZmlnU2NoZW1hVmFsdWUoKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0NvbmZpZ091dHB1dFBhdGggPSBwYXRoLmpvaW4oY29uZmlnUGF0aCwgREVGQVVMVF9DTElfVkFMVUVTLkNvbmZpZ0ZpbGVOYW1lKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgd3JpdGVKU09OKG5ld0NvbmZpZ091dHB1dFBhdGgsIGNvbmZpZywgeyBzcGFjZXM6IDQgfSk7XHJcbiAgICAgICAgICAgIENMSUxvZ2dlci5JbmZvKGBTdWNjZXNzZnVsbHkgc2F2ZWQgY29uZmlnIHRvOiBcIiR7bmV3Q29uZmlnT3V0cHV0UGF0aH1cImApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIENMSUxvZ2dlci5Dcml0aWNhbChlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgQ29uZmlnSW5pdGlhbGl6YXRpb25Db21tYW5kID0gbmV3IENvbmZpZ0luaXRpYWxpemF0aW9uQ29tbWFuZENsYXNzO1xyXG4iXX0=