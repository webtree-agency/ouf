import assert from "node:assert/strict";
import { test } from "node:test";

import { genderFromArticle } from "./gender.ts";

test("liest das Genus aus le, la, un und une", () => {
  assert.equal(genderFromArticle("la maison"), "f");
  assert.equal(genderFromArticle("Le chat"), "m");
  assert.equal(genderFromArticle("une pomme"), "f");
  assert.equal(genderFromArticle("un livre"), "m");
});

test("lässt l' und les offen", () => {
  assert.equal(genderFromArticle("l'eau"), null);
  assert.equal(genderFromArticle("l’arbre"), null);
  assert.equal(genderFromArticle("les gens"), null);
});

test("hält ein Wort, das nur so anfängt, nicht für einen Artikel", () => {
  assert.equal(genderFromArticle("lait"), null);
  assert.equal(genderFromArticle("laver"), null);
  assert.equal(genderFromArticle("lent"), null);
});
