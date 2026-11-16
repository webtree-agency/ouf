import assert from "node:assert/strict";
import { test } from "node:test";

import { emojiForName, searchEmoji, type EmojiEntry } from "./search.ts";

const DATA: EmojiEntry[] = [
  { unicode: "🚗", label: "Auto", tags: ["Fahrzeug", "fahren"], group: 5 },
  {
    unicode: "🚙",
    label: "Geländewagen",
    tags: ["Auto", "Fahrzeug"],
    group: 5,
  },
  { unicode: "🍷", label: "Weinglas", tags: ["Wein", "Getränk"], group: 4 },
  { unicode: "☕", label: "Heißgetränk", tags: ["Kaffee", "Tee"], group: 4 },
  { unicode: "🏻", label: "helle Hautfarbe", tags: ["Hautfarbe"], group: 2 },
];

test("findet über Name und Stichwort, der Name zuerst", () => {
  assert.deepEqual(searchEmoji(DATA, "auto"), ["🚗", "🚙"]);
  assert.deepEqual(searchEmoji(DATA, "kaffee"), ["☕"]);
});

test("übersieht Akzente und Grossschreibung, kennt keine Bausteine", () => {
  assert.deepEqual(searchEmoji(DATA, "HEISS"), []);
  assert.deepEqual(searchEmoji(DATA, "Weinglas"), ["🍷"]);
  assert.deepEqual(searchEmoji(DATA, "hautfarbe"), []);
});

test("zum Namen eines Decks die Treffer seiner Wörter", () => {
  assert.deepEqual(emojiForName(DATA, "Wein & Kaffee"), ["🍷", "☕"]);
  assert.deepEqual(emojiForName(DATA, "à la"), []);
});
