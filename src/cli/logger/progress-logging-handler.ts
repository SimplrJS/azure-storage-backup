import * as Progress from "progress";
import * as processTypesOnly from "process";
import { MessageHandlerBase, LoggerHelpers, LogLevel, PrefixType } from "simplr-logger";

export interface ProgressTokens {
    LastActionTitle: string;
    LogLevel: string;
}

export function IsServerSide(): boolean {
    try {
        // tslint:disable-next-line:no-require-imports no-unused-expression
        require("process") as typeof processTypesOnly;
        return true;
    } catch {
        return false;
    }
}

export class ProgressLoggingHandler extends MessageHandlerBase {
    constructor(private progress?: Progress) {
        super();
        this.isServerSide = IsServerSide();
    }

    private isServerSide: boolean;

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

    public Format: string = "[:bar] :percent :current / :total :elapsed seconds elapsed. " +
        ":eta seconds left. (:logLevel) :lastActionTitle";

    public Width: number = 20;

    public set Progress(progress: Progress) {
        this.progress = progress;
    }

    public NewProgress(total: number, format: string = this.Format, width: number = this.Width): Progress {
        this.progress = new Progress(format, {
            total: total,
            width: width
        });

        return this.progress;
    }

    public ClearProgress(): void {
        this.progress = undefined;
    }

    public Tick(tokens?: ProgressTokens): void {
        if (this.progress != null) {
            this.progress.tick(tokens);
        }
    }
}
