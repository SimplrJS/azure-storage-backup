import * as Progress from "progress";
import { MessageHandlerBase, LogLevel } from "simplr-logger";
export interface ProgressTokens {
    LastActionTitle: string;
    LogLevel: string;
}
/**
 * Handles progress logging.
 */
export declare class ProgressLoggingHandler extends MessageHandlerBase {
    private progress;
    constructor(progress?: Progress | undefined);
    private isServerSide;
    /**
     * Handles a message in progress.
     *
     * @param level Message log level.
     * @param timestamp Timestamp of logger (optional).
     * @param messages Messages to log (optional).
     */
    HandleMessage(level: LogLevel, timestamp?: number, messages?: any[]): void;
    /**
     * Progress line format.
     */
    Format: string;
    /**
     * Width of progress bar.
     */
    ProgressBarWidth: number;
    /**
     * Sets progress instance.
     */
    Progress: Progress;
    /**
     * Creates a new progress.
     *
     * @param total Total count of ticks to complete.
     * @param format Progress bar format. Default value defined in `ProgressLoggingHandler.Format`.
     * @param progressBarWidth Progress bar width. Default value defined in `ProgressLoggingHandler.ProgressBarWidth`.
     * @returns Progress instance.
     */
    NewProgress(total: number, format?: string, progressBarWidth?: number): Progress;
    /**
     * Clears instance of current progress.
     */
    ClearProgress(): void;
    /**
     * Updates progress with one tick.
     */
    Tick(tokens?: ProgressTokens): void;
}
