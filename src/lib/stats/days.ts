import { addDays, dayKey } from "../time/day.ts";

export type DayCount = { day: string; count: number };

/**
 * Eine Zahl für jeden Tag, auch für die ohne Eintrag. Die Abfrage liefert nur
 * Tage mit Zeilen; ein Diagramm mit Lücken zeigte sonst Montag neben Freitag.
 */
export function fillDays<T extends { day: string }>(
  rows: readonly T[],
  from: Date,
  days: number,
  empty: (day: string) => T,
): T[] {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  return Array.from({ length: days }, (_, index) => {
    const day = dayKey(addDays(from, index));
    return byDay.get(day) ?? empty(day);
  });
}

const WEEKDAY = new Intl.DateTimeFormat("de-CH", {
  weekday: "short",
  timeZone: "UTC",
});

/** „Mo 16." aus `2026-11-16`. */
export function dayLabel(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  return `${WEEKDAY.format(date).replace(".", "")} ${date.getUTCDate()}.`;
}

/** Anteil in ganzen Prozent; ohne Grundmenge keine Zahl. */
export function share(part: number, total: number): number | null {
  return total === 0 ? null : Math.round((part / total) * 100);
}
