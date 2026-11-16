/**
 * Die Wortmarke als Pfade, nicht als Text: so sieht sie in jedem Browser
 * gleich aus, ohne dass eine Schrift geladen sein muss. Das «o» ist der Ring
 * des App-Icons, «uf» sind kräftige, runde Striche.
 */
export const LOGO_VIEWBOX = "45 12 130 63";

export const RING = { cx: 70, cy: 50, r: 15.5, width: 11 };

export const LETTER_PATHS = [
  // u
  "M104 34V54C104 61 107 66 114 66C121 66 124 61 124 54M124 34V66",
  // f
  "M139 66V30C139 23 142 19 149 19C151 19 153 19.5 154.5 20.5M131 36H151",
];

export const DOT = { cx: 165, cy: 61, r: 6.5 };

export const STROKE_WIDTH = 10;

// Pastell, mittleres Blau, wieder hell: der Verlauf glänzt wie das Webtree-Zeichen
// und bleibt auf Weiss wie auf Schwarz sichtbar.
export const SHEEN = [
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
