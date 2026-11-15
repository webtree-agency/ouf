import { counted, type Unit } from "./plural.ts";

/**
 * Die Zeile unter dem Kartentitel: wie viele es insgesamt sind und wo man
 * gerade ist. Die Gesamtzahl gilt für die Auswahl, nicht für die Seite —
 * sonst stünde bei „30 Einträge" nie etwas anderes als die Seitengrösse.
 */
export function listSummary(
  total: number,
  page: number,
  pageCount: number,
  labels: Unit,
): string {
  const menge = counted(total, labels);
  return pageCount > 1 ? `${menge} · Seite ${page} von ${pageCount}` : menge;
}
