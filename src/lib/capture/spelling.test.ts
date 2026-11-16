import assert from "node:assert/strict";
import { test } from "node:test";

import { checkSpelling, corrected, type Match } from "./spelling.ts";

function match(offset: number, length: number, value: string, id = "X"): Match {
  return { offset, length, replacements: [{ value }], rule: { id } };
}

test("setzt den ersten Vorschlag ein, auch mehrere in einem Ausdruck", () => {
  assert.equal(corrected("la bagole", [match(3, 6, "bagnole")]), "la bagnole");
  assert.equal(
    corrected("le maison bleu", [
      match(0, 9, "la maison"),
      match(10, 4, "bleue"),
    ]),
    "la maison bleue",
  );
});

test("Kleinschreibung am Anfang und Satzzeichen sind kein Fehler", () => {
  assert.equal(
    corrected("un arbre", [match(0, 2, "Un", "UPPERCASE_SENTENCE_START")]),
    null,
  );
  assert.equal(corrected("un arbre", []), null);
});

test("fragt mit dem Code der Sprache und schweigt, wenn der Dienst ausfällt", async () => {
  const sent: string[] = [];
  const ok: typeof fetch = async (_url, init) => {
    sent.push(String(init?.body));
    return Response.json({ matches: [match(3, 6, "bagnole")] });
  };
  assert.equal(await checkSpelling("la bagole", "fr", ok), "la bagnole");
  assert.match(sent[0], /language=fr/);

  const down: typeof fetch = async () => new Response("", { status: 503 });
  assert.equal(await checkSpelling("la bagole", "fr", down), null);
});
