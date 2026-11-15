// Reihenfolge zählt: Edge und Chrome nennen sich beide „Safari", Chrome nennt
// sich zusätzlich „Chrome". Der erste Treffer gewinnt.
const BROWSERS: [RegExp, string][] = [
  [/\bFirefox\//, "Firefox"],
  [/\bEdg\//, "Edge"],
  [/\bChrome\//, "Chrome"],
  [/\bSafari\//, "Safari"],
];

export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unbekanntes Gerät";

  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = /\(([^)]+)\)/.exec(userAgent)?.[1].split(";")[0].trim();

  if (!browser && !system) return "Unbekanntes Gerät";
  if (!system) return browser as string;

  return browser ? `${browser}, ${system}` : system;
}
