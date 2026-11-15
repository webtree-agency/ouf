import assert from "node:assert/strict";
import { test } from "node:test";

import { LANGUAGES, languageProfile } from "./catalog.ts";

test("vorbereitet ist nur Französisch, mit Genus", () => {
  assert.deepEqual(
    LANGUAGES.filter((language) => language.genders).map(
      (language) => language.code,
    ),
    ["fr"],
  );
  assert.equal(languageProfile("fr").speech, "fr-FR");
});

test("eine unbekannte Kennung bekommt ein leeres Profil statt eines Fehlers", () => {
  assert.deepEqual(languageProfile("xx"), {
    code: "xx",
    name: "xx",
    speech: "xx",
    genders: false,
  });
});
