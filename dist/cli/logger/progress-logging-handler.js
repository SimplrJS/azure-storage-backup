"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Progress = require("progress");
var simplr_logger_1 = require("simplr-logger");
/**
 * Handles progress logging.
 */
var ProgressLoggingHandler = /** @class */ (function (_super) {
    tslib_1.__extends(ProgressLoggingHandler, _super);
    function ProgressLoggingHandler(progress) {
        var _this = _super.call(this) || this;
        _this.progress = progress;
        /**
         * Progress line format.
         */
        _this.Format = "[:bar] :percent :current / :total :elapsed seconds elapsed. " +
            ":eta seconds left. (:logLevel) :lastActionTitle";
        /**
         * Width of progress bar.
         */
        _this.ProgressBarWidth = 20;
        _this.isServerSide = simplr_logger_1.LoggerHelpers.IsServerSide();
        return _this;
    }
    /**
     * Handles a message in progress.
     *
     * @param level Message log level.
     * @param timestamp Timestamp of logger (optional).
     * @param messages Messages to log (optional).
     */
    ProgressLoggingHandler.prototype.HandleMessage = function (level, timestamp, messages) {
        if (!this.isServerSide) {
            return;
        }
        if (this.progress != null) {
            var levelString = simplr_logger_1.LoggerHelpers.ResolveLogLevelPrefix(simplr_logger_1.PrefixType.Short, level);
            this.progress.render({
                lastActionTitle: messages,
                logLevel: levelString
            });
        }
    };
    Object.defineProperty(ProgressLoggingHandler.prototype, "Progress", {
        /**
         * Sets progress instance.
         */
        set: function (progress) {
            this.progress = progress;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a new progress.
     *
     * @param total Total count of ticks to complete.
     * @param format Progress bar format. Default value defined in `ProgressLoggingHandler.Format`.
     * @param progressBarWidth Progress bar width. Default value defined in `ProgressLoggingHandler.ProgressBarWidth`.
     * @returns Progress instance.
     */
    ProgressLoggingHandler.prototype.NewProgress = function (total, format, progressBarWidth) {
        if (format === void 0) { format = this.Format; }
        if (progressBarWidth === void 0) { progressBarWidth = this.ProgressBarWidth; }
        this.progress = new Progress(format, {
            total: total,
            width: progressBarWidth
        });
        return this.progress;
    };
    /**
     * Clears instance of current progress.
     */
    ProgressLoggingHandler.prototype.ClearProgress = function () {
        this.progress = undefined;
    };
    /**
     * Updates progress with one tick.
     */
    ProgressLoggingHandler.prototype.Tick = function (tokens) {
        if (this.progress != null) {
            this.progress.tick(tokens);
        }
    };
    return ProgressLoggingHandler;
}(simplr_logger_1.MessageHandlerBase));
exports.ProgressLoggingHandler = ProgressLoggingHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtbG9nZ2luZy1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9sb2dnZXIvcHJvZ3Jlc3MtbG9nZ2luZy1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFxQztBQUNyQywrQ0FBd0Y7QUFNeEY7O0dBRUc7QUFDSDtJQUE0QyxrREFBa0I7SUFDMUQsZ0NBQW9CLFFBQW1CO1FBQXZDLFlBQ0ksaUJBQU8sU0FFVjtRQUhtQixjQUFRLEdBQVIsUUFBUSxDQUFXO1FBNkJ2Qzs7V0FFRztRQUNJLFlBQU0sR0FBVyw4REFBOEQ7WUFDbEYsaURBQWlELENBQUM7UUFFdEQ7O1dBRUc7UUFDSSxzQkFBZ0IsR0FBVyxFQUFFLENBQUM7UUFwQ2pDLEtBQUksQ0FBQyxZQUFZLEdBQUcsNkJBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7SUFDckQsQ0FBQztJQUlEOzs7Ozs7T0FNRztJQUNJLDhDQUFhLEdBQXBCLFVBQXFCLEtBQWUsRUFBRSxTQUFrQixFQUFFLFFBQWdCO1FBQ3RFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFNLFdBQVcsR0FBRyw2QkFBYSxDQUFDLHFCQUFxQixDQUFDLDBCQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWpGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNqQixlQUFlLEVBQUUsUUFBUTtnQkFDekIsUUFBUSxFQUFFLFdBQVc7YUFDeEIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFnQkQsc0JBQVcsNENBQVE7UUFIbkI7O1dBRUc7YUFDSCxVQUFvQixRQUFrQjtZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDOzs7T0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSw0Q0FBVyxHQUFsQixVQUFtQixLQUFhLEVBQUUsTUFBNEIsRUFBRSxnQkFBZ0Q7UUFBOUUsdUJBQUEsRUFBQSxTQUFpQixJQUFJLENBQUMsTUFBTTtRQUFFLGlDQUFBLEVBQUEsbUJBQTJCLElBQUksQ0FBQyxnQkFBZ0I7UUFDNUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDakMsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsZ0JBQWdCO1NBQzFCLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNJLDhDQUFhLEdBQXBCO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUVEOztPQUVHO0lBQ0kscUNBQUksR0FBWCxVQUFZLE1BQXVCO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixDQUFDO0lBQ0wsQ0FBQztJQUNMLDZCQUFDO0FBQUQsQ0FBQyxBQWhGRCxDQUE0QyxrQ0FBa0IsR0FnRjdEO0FBaEZZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFByb2dyZXNzIGZyb20gXCJwcm9ncmVzc1wiO1xyXG5pbXBvcnQgeyBNZXNzYWdlSGFuZGxlckJhc2UsIExvZ2dlckhlbHBlcnMsIExvZ0xldmVsLCBQcmVmaXhUeXBlIH0gZnJvbSBcInNpbXBsci1sb2dnZXJcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUHJvZ3Jlc3NUb2tlbnMge1xyXG4gICAgTGFzdEFjdGlvblRpdGxlOiBzdHJpbmc7XHJcbiAgICBMb2dMZXZlbDogc3RyaW5nO1xyXG59XHJcbi8qKlxyXG4gKiBIYW5kbGVzIHByb2dyZXNzIGxvZ2dpbmcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUHJvZ3Jlc3NMb2dnaW5nSGFuZGxlciBleHRlbmRzIE1lc3NhZ2VIYW5kbGVyQmFzZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHByb2dyZXNzPzogUHJvZ3Jlc3MpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuaXNTZXJ2ZXJTaWRlID0gTG9nZ2VySGVscGVycy5Jc1NlcnZlclNpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzU2VydmVyU2lkZTogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgYSBtZXNzYWdlIGluIHByb2dyZXNzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBsZXZlbCBNZXNzYWdlIGxvZyBsZXZlbC5cclxuICAgICAqIEBwYXJhbSB0aW1lc3RhbXAgVGltZXN0YW1wIG9mIGxvZ2dlciAob3B0aW9uYWwpLlxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2VzIE1lc3NhZ2VzIHRvIGxvZyAob3B0aW9uYWwpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgSGFuZGxlTWVzc2FnZShsZXZlbDogTG9nTGV2ZWwsIHRpbWVzdGFtcD86IG51bWJlciwgbWVzc2FnZXM/OiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1NlcnZlclNpZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBsZXZlbFN0cmluZyA9IExvZ2dlckhlbHBlcnMuUmVzb2x2ZUxvZ0xldmVsUHJlZml4KFByZWZpeFR5cGUuU2hvcnQsIGxldmVsKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKHtcclxuICAgICAgICAgICAgICAgIGxhc3RBY3Rpb25UaXRsZTogbWVzc2FnZXMsXHJcbiAgICAgICAgICAgICAgICBsb2dMZXZlbDogbGV2ZWxTdHJpbmdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvZ3Jlc3MgbGluZSBmb3JtYXQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBGb3JtYXQ6IHN0cmluZyA9IFwiWzpiYXJdIDpwZXJjZW50IDpjdXJyZW50IC8gOnRvdGFsIDplbGFwc2VkIHNlY29uZHMgZWxhcHNlZC4gXCIgK1xyXG4gICAgICAgIFwiOmV0YSBzZWNvbmRzIGxlZnQuICg6bG9nTGV2ZWwpIDpsYXN0QWN0aW9uVGl0bGVcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdpZHRoIG9mIHByb2dyZXNzIGJhci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIFByb2dyZXNzQmFyV2lkdGg6IG51bWJlciA9IDIwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBwcm9ncmVzcyBpbnN0YW5jZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBQcm9ncmVzcyhwcm9ncmVzczogUHJvZ3Jlc3MpIHtcclxuICAgICAgICB0aGlzLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHByb2dyZXNzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB0b3RhbCBUb3RhbCBjb3VudCBvZiB0aWNrcyB0byBjb21wbGV0ZS5cclxuICAgICAqIEBwYXJhbSBmb3JtYXQgUHJvZ3Jlc3MgYmFyIGZvcm1hdC4gRGVmYXVsdCB2YWx1ZSBkZWZpbmVkIGluIGBQcm9ncmVzc0xvZ2dpbmdIYW5kbGVyLkZvcm1hdGAuXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3Jlc3NCYXJXaWR0aCBQcm9ncmVzcyBiYXIgd2lkdGguIERlZmF1bHQgdmFsdWUgZGVmaW5lZCBpbiBgUHJvZ3Jlc3NMb2dnaW5nSGFuZGxlci5Qcm9ncmVzc0JhcldpZHRoYC5cclxuICAgICAqIEByZXR1cm5zIFByb2dyZXNzIGluc3RhbmNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgTmV3UHJvZ3Jlc3ModG90YWw6IG51bWJlciwgZm9ybWF0OiBzdHJpbmcgPSB0aGlzLkZvcm1hdCwgcHJvZ3Jlc3NCYXJXaWR0aDogbnVtYmVyID0gdGhpcy5Qcm9ncmVzc0JhcldpZHRoKTogUHJvZ3Jlc3Mge1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MgPSBuZXcgUHJvZ3Jlc3MoZm9ybWF0LCB7XHJcbiAgICAgICAgICAgIHRvdGFsOiB0b3RhbCxcclxuICAgICAgICAgICAgd2lkdGg6IHByb2dyZXNzQmFyV2lkdGhcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvZ3Jlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgaW5zdGFuY2Ugb2YgY3VycmVudCBwcm9ncmVzcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIENsZWFyUHJvZ3Jlc3MoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzcyA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgcHJvZ3Jlc3Mgd2l0aCBvbmUgdGljay5cclxuICAgICAqL1xyXG4gICAgcHVibGljIFRpY2sodG9rZW5zPzogUHJvZ3Jlc3NUb2tlbnMpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5wcm9ncmVzcyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MudGljayh0b2tlbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=