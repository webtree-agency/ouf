/**
 * Wohin es nach einem Sprachwechsel geht: zum Anfang des Bereichs, ohne
 * Filter. Ein Deck oder eine Karte der alten Sprache gibt es in der neuen
 * nicht, `/karten/<id>` führte ins Leere.
 */
export function sectionRoot(pathname: string): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return "/";
  const [first] = pathname.split(/[?#]/)[0].split("/").filter(Boolean);
  return first ? `/${first}` : "/";
}
