import assert from "node:assert/strict";
import { test } from "node:test";

import { checkSpelling, corrections, type Match } from "./spelling.ts";

function match(
  offset: number,
  length: number,
  values: string[],
  id = "X",
): Match {
  return {
    offset,
    length,
    replacements: values.map((value) => ({ value })),
    rule: { id },
  };
}

test("bietet bis zu drei Fassungen für den ersten Fehler an", () => {
  assert.deepEqual(
    corrections("ta guele", [match(3, 5, ["rue-le", "gelé", "gèle", "guère"])]),
    ["ta rue-le", "ta gelé", "ta gèle"],
  );
});

test("weitere Fehler bekommen ihren ersten Vorschlag", () => {
  assert.deepEqual(
    corrections("le maison bleu", [
      match(0, 9, ["la maison", "les maisons"]),
      match(10, 4, ["bleue"]),
    ]),
    ["la maison bleue", "les maisons bleue"],
  );
});

test("Akzente kommen, die Kleinschreibung bleibt", () => {
  assert.deepEqual(corrections("tres bien", [match(0, 4, ["Très", "Près"])]), [
    "très bien",
    "près bien",
  ]);
  assert.deepEqual(corrections("un garcon", [match(3, 6, ["garçon"])]), [
    "un garçon",
  ]);
});

test("Kleinschreibung am Anfang und Satzzeichen sind kein Fehler", () => {
  assert.deepEqual(
    corrections("un arbre", [match(0, 2, ["Un"], "UPPERCASE_SENTENCE_START")]),
    [],
  );
});

test("fragt mit dem Code der Sprache und schweigt, wenn der Dienst ausfällt", async () => {
  const sent: string[] = [];
  const ok: typeof fetch = async (_url, init) => {
    sent.push(String(init?.body));
    return Response.json({ matches: [match(3, 6, ["bagnole"])] });
  };
  assert.deepEqual(await checkSpelling("la bagole", "fr", ok), ["la bagnole"]);
  assert.match(sent[0], /language=fr/);

  const down: typeof fetch = async () => new Response("", { status: 503 });
  assert.deepEqual(await checkSpelling("la bagole", "fr", down), []);
});

test("Abkürzungen sind keine Korrektur", () => {
  assert.deepEqual(
    corrections("le cafe", [match(3, 4, ["café", "CAF", "cafés"])]),
    ["le café", "le cafés"],
  );
});
