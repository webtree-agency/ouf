/**
 * Die Wortmarke als Pfade, nicht als Text: so sieht sie in jedem Browser, im
 * Favicon und im PNG gleich aus, ohne dass eine Schrift geladen sein muss.
 * Raster 200 × 100; die Buchstaben sind kräftige, runde Striche.
 */
export const BRUSH_PATH =
  "M31 29C62 21 131 19 171 23C184 24 189 36 187 50C185 66 181 76 166 78C121 81 70 83 34 79C20 77 13 65 14 50C15 38 20 31 31 29Z";

export const LETTER_PATHS = [
  // o
  "M61 50C61 41 65 34 71 34C77 34 81 41 81 50C81 59 77 66 71 66C65 66 61 59 61 50Z",
  // u
  "M92 34V54C92 61 95 66 102 66C109 66 112 61 112 54M112 34V66",
  // f
  "M127 66V30C127 23 130 19 137 19C139 19 141 19.5 142.5 20.5M119 36H139",
];

export const DOT = { cx: 151, cy: 61, r: 6.2 };

export const STROKE_WIDTH = 10;

// Pastell, mittleres Blau, wieder hell: der Verlauf glänzt wie das Webtree-Zeichen
// und bleibt auf Weiss wie auf Schwarz sichtbar.
const SHEEN = [
  ["0", "#bbd3f2"],
  ["0.55", "#4270aa"],
  ["0.8", "#618fc8"],
  ["1", "#89b1e3"],
];

/**
 * Das App-Icon: das «o.» aus dem Namen, ein Ring mit Punkt, ohne Grund und
 * ohne Schrift (Jann, 16.11.2026). Raster 100 × 100.
 */
export function appIconSvg(): string {
  const stops = SHEEN.map(
    ([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="12" y1="14" x2="90" y2="88">${stops}</linearGradient></defs><circle cx="43" cy="47" r="27" fill="none" stroke="url(#sheen)" stroke-width="16"/><circle cx="83" cy="79" r="9" fill="url(#sheen)"/></svg>`;
}
