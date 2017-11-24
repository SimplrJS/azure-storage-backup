import { LoggerConfigurationBuilder, LogLevel, LoggerBuilder, PrefixType } from "simplr-logger";
import { ConsoleMessageHandler, FileMessageHandler } from "simplr-logger/handlers";
import { ResolveLogPath } from "../cli-helpers";

export const LoggerConsoleMessageHandler = new ConsoleMessageHandler({ TimePrefix: PrefixType.Full });

export const ConsoleMessageHandlerLevels = [LogLevel.Information, LogLevel.Critical];

const InitialLoggerConfig = new LoggerConfigurationBuilder()
    .AddWriteMessageHandler({ Handler: LoggerConsoleMessageHandler }, ConsoleMessageHandlerLevels)
    .Build();

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

export const CLILogger = new LoggerBuilder(InitialLoggerConfig);
