/**
 * Zeilen einer Datei zu Karten und zurück. Erkannt wird eine Kopfzeile mit
 * deutschen oder englischen Namen; ohne sie gilt die Reihenfolge von Ankis
 * Textexport: Vorderseite, Rückseite, dann wahlweise Beispiel und Notiz.
 */
export const HEADER = [
  "vorderseite",
  "rueckseite",
  "beispiel",
  "notiz",
  "genus",
  "tags",
  "rueckwaerts",
  "deck",
] as const;
type Column = (typeof HEADER)[number];

const NAMES: Record<Column, string[]> = {
  vorderseite: ["vorderseite", "front", "vorne"],
  rueckseite: ["rueckseite", "rückseite", "back", "hinten"],
  beispiel: ["beispiel", "beispielsatz", "example"],
  notiz: ["notiz", "note", "notes"],
  genus: ["genus", "gender"],
  tags: ["tags", "tag"],
  rueckwaerts: ["rueckwaerts", "rückwärts", "reverse"],
  deck: ["deck"],
};

export type ImportCard = {
  line: number;
  front: string;
  back: string;
  example: string;
  note: string;
  gender: "m" | "f" | "";
  tags: string;
  reverse: boolean;
  deck: string | null;
};

const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
};

/** Anki speichert Felder als HTML; übrig bleibt der Text. */
export function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>|<\/(div|p|li)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(nbsp|amp|lt|gt|quot|#39|apos);/g,
      (_, name: string) => ENTITIES[name],
    )
    .replace(/\s+/g, " ")
    .trim();
}

function genderOf(value: string): ImportCard["gender"] {
  const wert = value.trim().toLowerCase();
  if (["m", "männlich", "masculin", "masc"].includes(wert)) return "m";
  if (["f", "w", "weiblich", "féminin", "feminin", "fem"].includes(wert))
    return "f";
  return "";
}

function yes(value: string): boolean {
  return ["ja", "yes", "true", "1", "x", "wahr"].includes(
    value.trim().toLowerCase(),
  );
}

function headerMap(row: readonly string[]): Map<Column, number> | null {
  const map = new Map<Column, number>();
  row.forEach((cell, index) => {
    const name = cell.trim().toLowerCase();
    const column = (Object.keys(NAMES) as Column[]).find((key) =>
      NAMES[key].includes(name),
    );
    if (column && !map.has(column)) map.set(column, index);
  });
  return map.has("vorderseite") && map.has("rueckseite") ? map : null;
}

const POSITIONAL = new Map<Column, number>([
  ["vorderseite", 0],
  ["rueckseite", 1],
  ["beispiel", 2],
  ["notiz", 3],
]);

export function readCards(rows: readonly (readonly string[])[]): ImportCard[] {
  const header = rows.length ? headerMap(rows[0]) : null;
  const columns = header ?? POSITIONAL;
  const start = header ? 1 : 0;

  return rows.slice(start).map((row, index) => {
    const cell = (column: Column) => {
      const position = columns.get(column);
      return position === undefined ? "" : stripHtml(row[position] ?? "");
    };
    return {
      line: index + start + 1,
      front: cell("vorderseite"),
      back: cell("rueckseite"),
      example: cell("beispiel"),
      note: cell("notiz"),
      gender: genderOf(cell("genus")),
      tags: cell("tags"),
      reverse: yes(cell("rueckwaerts")),
      deck: cell("deck") || null,
    };
  });
}

export type ExportCard = {
  front: string;
  back: string;
  example: string | null;
  note: string | null;
  gender: "m" | "f" | null;
  tags: string[];
  reverse: boolean;
  deck: string;
};

export function writeCards(cards: readonly ExportCard[]): string[][] {
  return [
    [...HEADER],
    ...cards.map((card) => [
      card.front,
      card.back,
      card.example ?? "",
      card.note ?? "",
      card.gender ?? "",
      card.tags.join(" "),
      card.reverse ? "ja" : "",
      card.deck,
    ]),
  ];
}
