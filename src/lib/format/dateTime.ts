/** Die Zeitzone von ouf. Ein Tag endet hier um Mitternacht (ENTSCHEIDE.md). */
export const TIME_ZONE = "Europe/Zurich";

const DATE = new Intl.DateTimeFormat("de-CH", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("de-CH", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** 15.11.2026 */
export function formatDate(date: Date): string {
  return DATE.format(date);
}

/** 15.11.2026, 23:40 */
export function formatDateTime(date: Date): string {
  return DATE_TIME.format(date);
}
