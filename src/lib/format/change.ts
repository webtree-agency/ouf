/**
 * Die Veränderung gegenüber dem Zeitraum davor, in Prozent. `null` heisst
 * **„lässt sich nicht sagen"** und ist keine Null: Wer von 0 auf 0 geht, hat
 * sich nicht verbessert, und wer von 0 auf 12 geht, ist nicht um unendlich
 * gewachsen. Beides als Zahl auszugeben wäre eine Auskunft, die niemand hat.
 */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export type Direction = "hoch" | "runter" | "gleich";

/**
 * **Bei der Position ist klein gut.** Platz 4 ist besser als Platz 11 — eine
 * sinkende Zahl ist dort ein Fortschritt und muss so aussehen, sonst steht ein
 * rotes Minus neben der besten Nachricht des Monats.
 */
export function directionOf(
  change: number | null,
  lowerIsBetter = false,
): Direction {
  if (change === null || change === 0) return "gleich";
  const gestiegen = change > 0;
  return gestiegen === lowerIsBetter ? "runter" : "hoch";
}

/** „▲ 317 %" — mit Zeichen, ohne Vorzeichen, denn der Pfeil sagt es schon. */
export function formatChange(change: number | null): string {
  if (change === null) return "—";
  const pfeil = change > 0 ? "▲" : change < 0 ? "▼" : "→";
  return `${pfeil} ${Math.abs(change)} %`;
}
