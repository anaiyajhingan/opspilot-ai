/**
 * Simple structured logger.
 *
 * In production, this could be swapped for a proper logging service
 * (Sentry, Axiom, Datadog, etc.) by changing this single file.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
};

export function logger(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (process.env.NODE_ENV === "production") {
    // In production, log as JSON for structured parsing
    console.log(JSON.stringify(entry));
  } else {
    // In development, log in a readable format
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    console.log(`[${entry.timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`);
  }
}

export const loggerApi = {
  info: (message: string, context?: Record<string, unknown>) => logger("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => logger("error", message, context),
  debug: (message: string, context?: Record<string, unknown>) => logger("debug", message, context),
};
