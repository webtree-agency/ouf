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

const dollarFormatter = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const centFractionFormatter = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

/**
 * Dollar für die Kosten von Diktat und Vorschlägen. Ein Vorschlag kostet
 * Hundertstel eines Cents; darunter wären es lauter „0.00 $".
 */
export function formatDollars(value: number): string {
  if (value > 0 && value < 0.0001) return "unter 0.0001 $";
  const formatter = value < 0.01 ? centFractionFormatter : dollarFormatter;
  return `${swissDigits(formatter.format(value))} $`;
}
