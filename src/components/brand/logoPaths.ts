/**
 * Die Wortmarke in Outfit SemiBold (SIL Open Font License), Laufweite -3 %, als
 * Pfade: so braucht die Seite keine zweite Schrift. Erzeugt mit opentype.js aus
 * der Schriftdatei von Google Fonts.
 */
// Ein Punkt Luft rundum, sonst schneidet die Kante die Glättung des Punkts ab.
export const LOGO_VIEWBOX = "-1 -1 164.9 76.4";

/** «ouf» ohne Punkt. */
export const LETTERS_PATH =
  "M25.90 74.40L25.90 74.40Q18.60 74.40 12.75 71.05Q6.90 67.70 3.45 61.95Q0 56.20 0 49.10L0 49.10Q0 42 3.40 36.35Q6.80 30.70 12.70 27.35Q18.60 24 25.80 24L25.80 24Q33.20 24 39.05 27.35Q44.90 30.70 48.30 36.35Q51.70 42 51.70 49.10L51.70 49.10Q51.70 56.20 48.30 61.95Q44.90 67.70 39.05 71.05Q33.20 74.40 25.90 74.40ZM25.80 62.20L25.80 62.20Q29.50 62.20 32.35 60.55Q35.20 58.90 36.75 55.95Q38.30 53 38.30 49.20L38.30 49.20Q38.30 45.40 36.70 42.50Q35.10 39.60 32.30 37.95Q29.50 36.30 25.80 36.30L25.80 36.30Q22.20 36.30 19.40 37.95Q16.60 39.60 15 42.50Q13.40 45.40 13.40 49.20L13.40 49.20Q13.40 53 15 55.95Q16.60 58.90 19.40 60.55Q22.20 62.20 25.80 62.20ZM77.70 74.40L77.70 74.40Q71.30 74.40 66.35 71.70Q61.40 69 58.60 64.20Q55.80 59.40 55.80 53.10L55.80 53.10L55.80 25.10L69 25.10L69 52.80Q69 55.80 70 57.95Q71 60.10 73 61.20Q75 62.30 77.70 62.30L77.70 62.30Q81.80 62.30 84.10 59.80Q86.40 57.30 86.40 52.80L86.40 52.80L86.40 25.10L99.50 25.10L99.50 53.10Q99.50 59.50 96.75 64.30Q94 69.10 89.05 71.75Q84.10 74.40 77.70 74.40ZM126.40 73.40L113.30 73.40L113.30 19.90Q113.30 14.10 115.80 9.65Q118.30 5.20 122.90 2.60Q127.50 0 133.70 0L133.70 0Q138.40 0 141.80 1.60Q145.20 3.20 147.90 6L147.90 6L139.60 14.40Q138.50 13.30 137.20 12.70Q135.90 12.10 133.90 12.10L133.90 12.10Q130.30 12.10 128.35 14.05Q126.40 16 126.40 19.60L126.40 19.60L126.40 73.40ZM140.70 36.60L102.10 36.60L102.10 25.10L140.70 25.10L140.70 36.60Z";

/** Der Punkt, der als Einziges im Verlauf steht. */
export const DOT_PATH =
  "M154.80 74.40L154.80 74.40Q151.20 74.40 148.90 72Q146.60 69.60 146.60 66.10L146.60 66.10Q146.60 62.60 148.90 60.20Q151.20 57.80 154.80 57.80L154.80 57.80Q158.30 57.80 160.60 60.20Q162.90 62.60 162.90 66.10L162.90 66.10Q162.90 69.60 160.60 72Q158.30 74.40 154.80 74.40Z";

// Pastell, mittleres Blau, wieder hell: der Verlauf glänzt wie das Webtree-Zeichen
// und bleibt auf Weiss wie auf Schwarz sichtbar.
export const SHEEN = [
  ["0", "#bbd3f2"],
  ["0.55", "#4270aa"],
  ["0.8", "#618fc8"],
  ["1", "#89b1e3"],
];

/**
 * Das App-Icon: nur das «o», dick, mit Luft zum Rand, ohne Grund (Jann, 16.11.2026).
 * Raster 100 × 100.
 */
export function appIconSvg(): string {
  const stops = SHEEN.map(
    ([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="13" y1="13" x2="87" y2="87">${stops}</linearGradient></defs><circle cx="50" cy="50" r="27" fill="none" stroke="url(#sheen)" stroke-width="20"/></svg>`;
}
