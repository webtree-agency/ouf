import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { readCards, stripHtml, writeCards } from "./cardRows.ts";

describe("readCards", () => {
  test("liest eine Kopfzeile, auf Deutsch oder Englisch, in beliebiger Reihenfolge", () => {
    const cards = readCards([
      ["Back", "Front", "Genus", "Tags", "Rückwärts", "Deck"],
      ["das Haus", "la maison", "weiblich", "wohnen", "ja", "Grundwortschatz"],
    ]);
    assert.deepEqual(cards[0], {
      line: 2,
      front: "la maison",
      back: "das Haus",
      example: "",
      note: "",
      gender: "f",
      tags: "wohnen",
      reverse: true,
      deck: "Grundwortschatz",
    });
  });

  test("ohne Kopfzeile gilt die Reihenfolge von Ankis Textexport", () => {
    const [card] = readCards([["le chat", "die Katze", "Le chat dort."]]);
    assert.equal(card.front, "le chat");
    assert.equal(card.back, "die Katze");
    assert.equal(card.example, "Le chat dort.");
    assert.equal(card.line, 1);
    assert.equal(card.deck, null);
  });
});

test("macht aus Ankis HTML Text", () => {
  assert.equal(
    stripHtml("l&#39;eau<br>das&nbsp;Wasser <b>kalt</b>"),
    "l'eau das Wasser kalt",
  );
});

test("was geschrieben wird, liest sich wieder gleich", () => {
  const rows = writeCards([
    {
      front: "le chat",
      back: "die Katze",
      example: null,
      note: "Tier",
      gender: "m",
      tags: ["tiere", "alltag"],
      reverse: true,
      deck: "Grundwortschatz",
    },
  ]);
  const [card] = readCards(rows);
  assert.equal(card.front, "le chat");
  assert.equal(card.note, "Tier");
  assert.equal(card.gender, "m");
  assert.equal(card.tags, "tiere alltag");
  assert.equal(card.reverse, true);
  assert.equal(card.deck, "Grundwortschatz");
});
