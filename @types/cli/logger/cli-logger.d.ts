import { LogLevel, LoggerBuilder } from "simplr-logger";
import { ConsoleMessageHandler } from "simplr-logger/handlers";
/**
 * Console Logger.
 */
export declare const LoggerConsoleMessageHandler: ConsoleMessageHandler;
/**
 * Log levels allowed to console.
 */
export declare const ConsoleMessageHandlerLevels: LogLevel[];
/**
 * Add file message handler to current CLI logger.
 *
 * @param logPath Path of a log file path.
 * @param noLogFile Prevents logging to a file (optional, default value is false).
 */
export declare function AddFileMessageHandler(logPath: string, noLogFile?: boolean): void;
/**
 * Global app logger.
 */
export declare const CLILogger: LoggerBuilder;
