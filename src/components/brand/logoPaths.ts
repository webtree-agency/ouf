/**
 * Die Wortmarke, geometrisch gebaut: Alle Striche sind so stark wie der Ring,
 * Bögen sind Kreise mit dem Radius des Rings, die x-Höhe ist sein Durchmesser.
 * Pfade statt Schrift, damit sie überall gleich aussieht.
 */
export const LOGO_VIEWBOX = "43 4 158 73";

export const STROKE_WIDTH = 11;

export const RING = { cx: 70, cy: 50, r: 15.5 };

export const LETTER_PATHS = [
  // u: zwei Stämme, unten ein Halbkreis wie die untere Hälfte des Rings
  "M105.5 34.5V50A15.5 15.5 0 0 0 136.5 50M136.5 34.5V65.5",
  // f: Stamm, oben ein Viertelkreis, Querstrich auf der x-Höhe
  "M160 65.5V28A12 12 0 0 1 172 16H176M151 34.5H172",
];

export const DOT = { cx: 186, cy: 64.5, r: 6.5 };

// Pastell, mittleres Blau, wieder hell: der Verlauf glänzt wie das Webtree-Zeichen
// und bleibt auf Weiss wie auf Schwarz sichtbar.
export const SHEEN = [
  ["0", "#bbd3f2"],
  ["0.55", "#4270aa"],
  ["0.8", "#618fc8"],
  ["1", "#89b1e3"],
];

/**
 * Das App-Icon: nur das «o», gross und dick, ohne Grund (Jann, 16.11.2026).
 * Raster 100 × 100.
 */
export function appIconSvg(): string {
  const stops = SHEEN.map(
    ([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="8" y1="8" x2="92" y2="92">${stops}</linearGradient></defs><circle cx="50" cy="50" r="33" fill="none" stroke="url(#sheen)" stroke-width="24"/></svg>`;
}
