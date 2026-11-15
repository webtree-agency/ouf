/**
 * Schweizer Zahlen: 34'706, nicht 34706 und nicht 34.706. Wo eine Menge vier
 * Stellen überschreitet, ist die Gruppierung kein Schmuck — ohne sie liest man
 * die Zahl zweimal.
 */
// de-CH liefert je nach ICU-Version ’ oder ′ als Tausendertrennzeichen.
// Auf Rechnungen steht der gerade Apostroph — hier festgenagelt, nicht der Laufzeit überlassen.
const THOUSANDS_SEPARATORS = /[’′  ]/g;

export function swissDigits(formatted: string): string {
  return formatted.replace(THOUSANDS_SEPARATORS, "'");
}

const countFormatter = new Intl.NumberFormat("de-CH", {
  maximumFractionDigits: 0,
});

/** Ganze Mengen — Leads, Kunden, Treffer. */
export function formatCount(value: number): string {
  return swissDigits(countFormatter.format(value));
}
