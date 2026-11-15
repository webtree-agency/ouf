import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  detectDelimiter,
  parseDelimited,
  serializeDelimited,
} from "./delimited.ts";

describe("parseDelimited", () => {
  test("liest Anführungszeichen, Trennzeichen und Umbrüche im Feld", () => {
    const text =
      'vorderseite,rueckseite\r\n"la maison","das Haus, das Heim"\n"dire","er sagt ""ja""\nund geht"\n';
    assert.deepEqual(parseDelimited(text, ","), [
      ["vorderseite", "rueckseite"],
      ["la maison", "das Haus, das Heim"],
      ["dire", 'er sagt "ja"\nund geht'],
    ]);
  });

  test("überspringt das BOM, leere Zeilen und Ankis Kopfzeilen", () => {
    const text = "﻿#separator:tab\n#html:true\nle chat\tdie Katze\n\n";
    assert.deepEqual(parseDelimited(text, "\t"), [["le chat", "die Katze"]]);
  });

  test("nimmt eine letzte Zeile ohne Umbruch", () => {
    assert.deepEqual(parseDelimited("a;b", ";"), [["a", "b"]]);
  });
});

test("erkennt Tab, Semikolon und Komma", () => {
  assert.equal(detectDelimiter("le chat\tdie Katze"), "\t");
  assert.equal(detectDelimiter("vorderseite;rueckseite;beispiel"), ";");
  assert.equal(detectDelimiter("vorderseite,rueckseite"), ",");
  assert.equal(detectDelimiter("#separator:tab\nl'eau\tdas Wasser"), "\t");
});

test("schreibt, was es lesen kann, und entschärft Formeln", () => {
  const rows = [
    ["la maison", "das Haus, das Heim", 'er sagt "ja"'],
    ["=1+1", "-er", "@x"],
  ];
  const text = serializeDelimited(rows, ",");
  assert.equal(text.split("\r\n")[1], "'=1+1,-er,'@x");
  assert.deepEqual(parseDelimited(text, ",")[0], rows[0]);
});
