/** Ein Eintrag aus `emojibase-data/de/compact.json`, so weit er hier zählt. */
export type EmojiEntry = {
  unicode: string;
  label: string;
  tags?: string[];
  group?: number;
};

// Gruppe 2 sind Bausteine (Hautfarben, Haare), keine Emojis zum Wählen.
const COMPONENTS = 2;
const LIMIT = 24;

function plain(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

function score(entry: EmojiEntry, words: string[]): number {
  const label = plain(entry.label);
  const tags = (entry.tags ?? []).map(plain);
  let total = 0;
  for (const word of words) {
    if (label === word) total += 4;
    else if (label.startsWith(word)) total += 3;
    else if (tags.includes(word)) total += 2;
    else if (label.includes(word) || tags.some((tag) => tag.startsWith(word)))
      total += 1;
    else return 0;
  }
  return total;
}

/**
 * **Emoji nach deutschem Namen suchen**: „Auto" → 🚗. Jedes Wort der Suche
 * muss passen; Name vor Stichwort, Anfang vor Mitte. Akzente zählen nicht.
 */
export function searchEmoji(entries: EmojiEntry[], query: string): string[] {
  const words = plain(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return entries
    .filter((entry) => entry.group !== COMPONENTS)
    .map((entry) => ({ entry, points: score(entry, words) }))
    .filter((hit) => hit.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, LIMIT)
    .map((hit) => hit.entry.unicode);
}

/** Für einen Namen wie „Essen & Trinken": die Treffer der einzelnen Wörter, gemischt. */
export function emojiForName(entries: EmojiEntry[], name: string): string[] {
  const words = plain(name)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3);
  const found = words.flatMap((word) => searchEmoji(entries, word).slice(0, 4));
  return [...new Set(found)].slice(0, 8);
}
