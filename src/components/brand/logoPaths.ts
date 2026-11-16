/**
 * Die Wortmarke, geometrisch gebaut: Alle Striche sind so stark wie der Ring,
 * Bögen sind Kreise mit dem Radius des Rings, die x-Höhe ist sein Durchmesser.
 * Enden gerade, nur der Punkt ist rund. Pfade statt Schrift, damit sie überall
 * gleich aussieht.
 */
export const LOGO_VIEWBOX = "47 8 133 66";

export const STROKE_WIDTH = 11;

export const RING = { cx: 70, cy: 50, r: 15.5 };

// Gerade abgeschnittene Enden: Stämme reichen genau von der x-Höhe (29) bis zur Grundlinie (71).
export const LETTER_PATHS = [
  // u: zwei Stämme, unten ein Halbkreis wie die untere Hälfte des Rings
  "M101.5 29V50A15.5 15.5 0 0 0 132.5 50M132.5 29V71",
  // f: Stamm, oben ein Viertelkreis, Querstrich auf der x-Höhe
  "M152 71V28A12 12 0 0 1 164 16H168M144 34.5H164",
];

export const DOT = { cx: 170.5, cy: 64.5, r: 6.5 };

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
