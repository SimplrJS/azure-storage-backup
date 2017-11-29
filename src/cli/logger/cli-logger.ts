import { LoggerConfigurationBuilder, LogLevel, LoggerBuilder, PrefixType } from "simplr-logger";
import { ConsoleMessageHandler, FileMessageHandler } from "simplr-logger/handlers";
import { ResolveLogPath } from "../cli-helpers";

/**
 * Console Logger.
 */
export const LoggerConsoleMessageHandler = new ConsoleMessageHandler({ TimePrefix: PrefixType.Full });

/**
 * Log levels allowed to console.
 */
export const ConsoleMessageHandlerLevels = [LogLevel.Information, LogLevel.Critical];

const InitialLoggerConfig = new LoggerConfigurationBuilder()
    .AddWriteMessageHandler({ Handler: LoggerConsoleMessageHandler }, ConsoleMessageHandlerLevels)
    .Build();

/**
 * Add file message handler to current CLI logger.
 *
 * @param logPath Path of a log file path.
 * @param noLogFile Prevents logging to a file (optional, default value is false).
 */
export function AddFileMessageHandler(logPath: string, noLogFile: boolean = false): void {
    if (noLogFile) {
        return;
    }

    const resolvedLogPath = ResolveLogPath(logPath);

    CLILogger.UpdateConfiguration(configBuilder => {
        const fileMessageHandler = new FileMessageHandler(resolvedLogPath, {
            IsServerSide: true
        });

        return configBuilder
            .AddWriteMessageHandler({ Handler: fileMessageHandler }, LogLevel.Debug)
            .Build();
    });
}

/**
 * Global app logger.
 */
export const CLILogger = new LoggerBuilder(InitialLoggerConfig);
