import assert from "node:assert/strict";
import { test } from "node:test";

import {
  filterFromParams,
  filterToQuery,
  withFilter,
  type LearnFilter,
} from "./filter.ts";

const DECK = "0d6f8f2c-6c47-4e7a-9a0f-0d1c3b8c2a11";

test("ohne Angabe gilt, was fällig ist, wie geplant, überall", () => {
  assert.deepEqual(filterFromParams({}), {
    deckId: undefined,
    tag: undefined,
    gender: undefined,
    level: undefined,
    direction: undefined,
    random: false,
    all: false,
  });
});

test("liest die Adresse und schreibt sie gleich zurück", () => {
  const query = `?deck=${DECK}&tag=essen&genus=f&stufe=schwer&richtung=zurueck&reihenfolge=zufall&umfang=alle`;
  const filter = filterFromParams(
    Object.fromEntries(new URLSearchParams(query)),
  );
  assert.equal(filterToQuery(filter), query);
});

test("was nicht passt, fällt still weg", () => {
  const filter = filterFromParams({
    deck: "x",
    genus: "n",
    stufe: "alt",
    richtung: "seitwärts",
    reihenfolge: "egal",
    tag: ["a", "b"],
  });
  assert.equal(filterToQuery(filter), "");
});

test("ein Chip ändert einen Teil und lässt den Rest", () => {
  const filter: LearnFilter = { tag: "essen", random: true, all: false };
  assert.equal(
    withFilter(filter, { gender: "m" }),
    "/lernen?tag=essen&genus=m&reihenfolge=zufall",
  );
  assert.equal(
    withFilter(filter, { tag: undefined }),
    "/lernen?reihenfolge=zufall",
  );
});
