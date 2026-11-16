import { TIME_ZONE } from "./dateTime.ts";

const HOUR = new Intl.DateTimeFormat("de-CH", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

const DAY = new Intl.DateTimeFormat("fr-CH", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Ab sechs Uhr abends sagt man in Frankreich „Bonsoir". */
export function greeting(now: Date): string {
  const hour = HOUR.formatToParts(now).find((part) => part.type === "hour");
  return Number(hour?.value) >= 18 ? "Bonsoir" : "Bonjour";
}

/** „lundi 16 novembre" */
export function frenchDay(now: Date): string {
  return DAY.format(now);
}
