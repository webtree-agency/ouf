import assert from "node:assert/strict";
import { test } from "node:test";

import { deeplConfigured, translateWithDeepl } from "./deepl.ts";

function answering(body: unknown, status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fake: typeof fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return Response.json(body, { status });
  };
  return { fake, calls };
}

test("der Gratis-Schlüssel geht an api-free, mit Sprache und Ziel Deutsch", async () => {
  const { fake, calls } = answering({
    translations: [{ text: "der Kaffee." }],
  });
  const back = await translateWithDeepl("le café", "fr", fake, {
    DEEPL_API_KEY: "abc:fx",
  });
  assert.equal(back, "der Kaffee");
  assert.equal(calls[0].url, "https://api-free.deepl.com/v2/translate");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    text: ["le café"],
    source_lang: "FR",
    target_lang: "DE",
  });
  assert.equal(
    (calls[0].init.headers as Record<string, string>).Authorization,
    "DeepL-Auth-Key abc:fx",
  );
});

test("ohne Schlüssel fragt es nicht, ein Fehler des Dienstes fliegt weiter", async () => {
  const { fake, calls } = answering({});
  assert.equal(await translateWithDeepl("x", "fr", fake, {}), null);
  assert.equal(calls.length, 0);
  assert.equal(deeplConfigured({}), false);
  const down = answering({}, 456);
  await assert.rejects(
    translateWithDeepl("x", "fr", down.fake, { DEEPL_API_KEY: "k" }),
  );
});
