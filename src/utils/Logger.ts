/**
 * Console-only logging utility
 * No network calls, no persistent storage
 * All logs are session-only (cleared on app restart)
 */

export type LogEvent =
  | 'app_started'
  | 'record_started'
  | 'record_completed'
  | 'record_stopped_early'
  | 'analysis_started'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'retry_clicked'
  | 'learn_more_clicked'
  | 'upgrade_screen_viewed'
  | 'notify_me_clicked'
  | 'privacy_screen_viewed'
  | 'permission_granted'
  | 'permission_denied';

interface LogEntry {
  readonly event: LogEvent;
  readonly timestamp: string;
  readonly data?: Record<string, unknown>;
}

/**
 * Simple console logger - no storage, no network
 */
export const Logger = {
  /**
   * Log an event to console only
   */
  log(event: LogEvent, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Console only - no storage, no network
    console.log(`[SonicState] ${entry.event}`, entry);
  },

  /**
   * Log error to console only
   */
  error(message: string, error?: unknown): void {
    console.error(`[SonicState] ERROR: ${message}`, error);
  },

  /**
   * Log warning to console only
   */
  warn(message: string, data?: unknown): void {
    console.warn(`[SonicState] WARN: ${message}`, data);
  },
} as const;

export default Logger;
