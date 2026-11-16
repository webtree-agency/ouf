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

/** Die Fläche fürs quadratische Zeichen (Favicon, App-Icon), Raster 100 × 100. */
export const SQUARE_BRUSH_PATH =
  "M15 21C35 11 70 9 86 15C95 19 96 37 95 54C94 72 92 84 80 88C60 94 33 94 17 87C7 82 5 66 5 50C5 36 7 25 15 21Z";

export const INK = "#182333";
export const PASTEL = "#bbd3f2";
export const CANVAS = "#f8f8f5";

function letters(transform: string): string {
  const strokes = LETTER_PATHS.map((d) => `<path d="${d}"/>`).join("");
  return `<g transform="${transform}"><g fill="none" stroke="${INK}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g><circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="${INK}"/></g>`;
}

/** Das Zeichen als SVG-Text, für die Icons (`scripts/icons.mts`). */
export function squareMarkSvg(
  options: { background?: string; scale?: number } = {},
): string {
  const scale = options.scale ?? 1;
  const ground = options.background
    ? `<rect width="100" height="100" fill="${options.background}"/>`
    : "";
  const brush = `<path d="${SQUARE_BRUSH_PATH}" fill="${PASTEL}" transform="rotate(-6 50 50)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${ground}<g transform="translate(50 50) scale(${scale}) translate(-50 -50)">${brush}${letters("translate(50 52) scale(0.8) translate(-107.5 -43)")}</g></svg>`;
}
