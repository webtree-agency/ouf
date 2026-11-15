const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const DECIMAL = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 1 });

function unit(value: number, one: string, many: string): string {
  return `${DECIMAL.format(value)} ${value === 1 ? one : many}`;
}

/**
 * Das Intervall neben einem Bewertungsknopf: „1 Min", „10 Min", „3 Std",
 * „1 Tag", „12 Tage", „1.5 Monate", „2 Jahre". Gerundet, weil es eine
 * Einschätzung ist, kein Termin.
 */
export function formatInterval(from: Date, to: Date): string {
  const ms = Math.max(0, to.getTime() - from.getTime());
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} Min`;
  if (ms < DAY) return `${Math.round(ms / HOUR)} Std`;
  if (ms < MONTH) return unit(Math.round(ms / DAY), "Tag", "Tage");
  if (ms < YEAR)
    return unit(Math.round((ms / MONTH) * 10) / 10, "Monat", "Monate");
  return unit(Math.round((ms / YEAR) * 10) / 10, "Jahr", "Jahre");
}
