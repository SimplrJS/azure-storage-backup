import * as Progress from "progress";
import { MessageHandlerBase, LoggerHelpers, LogLevel, PrefixType } from "simplr-logger";

export interface ProgressTokens {
    LastActionTitle: string;
    LogLevel: string;
}
/**
 * Handles progress logging.
 */
export class ProgressLoggingHandler extends MessageHandlerBase {
    constructor(private progress?: Progress) {
        super();
        this.isServerSide = LoggerHelpers.IsServerSide();
    }

    private isServerSide: boolean;

    /**
     * Handles a message in progress.
     *
     * @param level Message log level.
     * @param timestamp Timestamp of logger (optional).
     * @param messages Messages to log (optional).
     */
    public HandleMessage(level: LogLevel, timestamp?: number, messages?: any[]): void {
        if (!this.isServerSide) {
            return;
        }

        if (this.progress != null) {
            const levelString = LoggerHelpers.ResolveLogLevelPrefix(PrefixType.Short, level);

            this.progress.render({
                lastActionTitle: messages,
                logLevel: levelString
            });
        }
    }

    /**
     * Progress line format.
     */
    public Format: string = "[:bar] :percent :current / :total :elapsed seconds elapsed. " +
        ":eta seconds left. (:logLevel) :lastActionTitle";

    /**
     * Width of progress bar.
     */
    public ProgressBarWidth: number = 20;

    /**
     * Sets progress instance.
     */
    public set Progress(progress: Progress) {
        this.progress = progress;
    }

    /**
     * Creates a new progress.
     *
     * @param total Total count of ticks to complete.
     * @param format Progress bar format. Default value defined in `ProgressLoggingHandler.Format`.
     * @param progressBarWidth Progress bar width. Default value defined in `ProgressLoggingHandler.ProgressBarWidth`.
     * @returns Progress instance.
     */
    public NewProgress(total: number, format: string = this.Format, progressBarWidth: number = this.ProgressBarWidth): Progress {
        this.progress = new Progress(format, {
            total: total,
            width: progressBarWidth
        });

        return this.progress;
    }

    /**
     * Clears instance of current progress.
     */
    public ClearProgress(): void {
        this.progress = undefined;
    }

    /**
     * Updates progress with one tick.
     */
    public Tick(tokens?: ProgressTokens): void {
        if (this.progress != null) {
            this.progress.tick(tokens);
        }
    }
}
