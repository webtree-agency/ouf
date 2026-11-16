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

/** Grund des App-Icons: fast schwarz mit einem Hauch Blau, wie beim Webtree-Icon. */
export const ICON_GROUND = "#0b1220";

// Hell, Pastell, mittleres Blau, wieder hell: der Verlauf glänzt wie das Webtree-Zeichen.
const SHEEN = [
  ["0", "#ebf6ff"],
  ["0.3", "#bbd3f2"],
  ["0.55", "#4270aa"],
  ["0.75", "#89b1e3"],
  ["1", "#cae2ff"],
];

/**
 * Das App-Icon: «ouf.» als Striche mit blauem Verlauf auf dunklem Grund, ohne
 * Pinselfläche. `rounded` rundet selbst (Favicon); iOS und Android runden selbst.
 */
export function appIconSvg(
  options: { scale?: number; rounded?: boolean } = {},
): string {
  const scale = options.scale ?? 0.72;
  const stops = SHEEN.map(
    ([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`,
  ).join("");
  const strokes = LETTER_PATHS.map((d) => `<path d="${d}"/>`).join("");
  const ground = `<rect width="100" height="100" rx="${options.rounded ? 22 : 0}" fill="${ICON_GROUND}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="56" y1="14" x2="160" y2="72">${stops}</linearGradient><radialGradient id="glow" cx="50" cy="44" r="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4270aa" stop-opacity="0.28"/><stop offset="1" stop-color="#4270aa" stop-opacity="0"/></radialGradient></defs>${ground}<rect width="100" height="100" rx="${options.rounded ? 22 : 0}" fill="url(#glow)"/><g transform="translate(50 50) scale(${scale}) translate(-106 -42.5)"><g fill="none" stroke="url(#sheen)" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g><circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="url(#sheen)"/></g></svg>`;
}
