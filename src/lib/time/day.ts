import { TIME_ZONE } from "../format/dateTime.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Der Tag in Zürich als `YYYY-MM-DD`. */
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Mitternacht in Zürich vor `date`, als Zeitpunkt. Ein Tag hat dort 23, 24
 * oder 25 Stunden; deshalb wird der Versatz zu Mitternacht gemessen, nicht
 * angenommen.
 */
export function startOfDay(date: Date): Date {
  const key = dayKey(date);
  // Erste Schätzung: Mitternacht UTC, dann um den Zürcher Versatz korrigieren.
  const utcMidnight = new Date(`${key}T00:00:00Z`);
  const offset = zurichOffsetMs(utcMidnight);
  const guess = new Date(utcMidnight.getTime() - offset);
  // Am Tag der Zeitumstellung kann der Versatz um Mitternacht ein anderer sein.
  const corrected = new Date(utcMidnight.getTime() - zurichOffsetMs(guess));
  return dayKey(corrected) === key ? corrected : guess;
}

/** Mitternacht nach `date`, also der Beginn des nächsten Tages. */
export function endOfDay(date: Date): Date {
  return startOfDay(
    new Date(startOfDay(date).getTime() + DAY_MS + 3 * 60 * 60 * 1000),
  );
}

export function addDays(date: Date, days: number): Date {
  return startOfDay(
    new Date(startOfDay(date).getTime() + days * DAY_MS + 12 * 60 * 60 * 1000),
  );
}

function zurichOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}
