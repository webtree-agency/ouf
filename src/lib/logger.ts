export type LogLevel = "info" | "warn" | "error";
export type LogContext = Record<string, unknown>;

// Eine Zeile JSON je Ereignis — Dokploy liest es roh, ein Log-Dienst später strukturiert.
export function formatLogLine(
  level: LogLevel,
  message: string,
  context: LogContext | undefined,
  time: Date,
): string {
  const entry = { time: time.toISOString(), level, message, ...context };
  try {
    return JSON.stringify(entry, replaceUnserializable);
  } catch {
    return JSON.stringify({ time: time.toISOString(), level, message });
  }
}

// Ein Error wird sonst zu {} — genau das, was man im Fehlerfall wissen will, fiele weg.
function replaceUnserializable(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  const line = formatLogLine(level, message, context, new Date());
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    write("info", message, context),
  warn: (message: string, context?: LogContext) =>
    write("warn", message, context),
  error: (message: string, context?: LogContext) =>
    write("error", message, context),
};
