import assert from "node:assert/strict";
import { test } from "node:test";

import { safeRedirectTarget } from "./redirectTarget.ts";

test("übernimmt einen eigenen Pfad", () => {
  assert.equal(safeRedirectTarget("/kunden/42"), "/kunden/42");
  assert.equal(
    safeRedirectTarget("/kunden?filter=offen"),
    "/kunden?filter=offen",
  );
});

test("fällt ohne Angabe auf die Startseite zurück", () => {
  assert.equal(safeRedirectTarget(undefined), "/");
  assert.equal(safeRedirectTarget(null), "/");
  assert.equal(safeRedirectTarget(""), "/");
});

test("leitet nicht auf eine fremde Adresse weiter", () => {
  assert.equal(safeRedirectTarget("//fremde.ch"), "/");
  assert.equal(safeRedirectTarget("https://fremde.ch"), "/");
  assert.equal(safeRedirectTarget("/\\fremde.ch"), "/");
  assert.equal(safeRedirectTarget("javascript:alert(1)"), "/");
});

// Der Browser streicht Tab und Zeilenumbruch aus einer Adresse: aus `/\t/boese.ch`
// wird `//boese.ch`. Ebenso wird `%2F` nicht dekodiert, `/%2F` bleibt eigen.
test("leitet auch über Steuerzeichen nicht auf eine fremde Adresse weiter", () => {
  for (const ziel of [
    "/\t/boese.ch",
    "/\n/boese.ch",
    "/\r/boese.ch",
    "\t//boese.ch",
    "/\u0000/boese.ch",
    "/\u007f/boese.ch",
    "/\t\\boese.ch",
    "/./\t/boese.ch",
  ]) {
    assert.equal(safeRedirectTarget(ziel), "/", JSON.stringify(ziel));
  }
});

test("lässt einen Pfad mit Leerzeichen-Kodierung und Anker stehen", () => {
  assert.equal(
    safeRedirectTarget("/leads?suche=a%20b#oben"),
    "/leads?suche=a%20b#oben",
  );
});
