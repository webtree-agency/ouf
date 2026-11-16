import assert from "node:assert/strict";
import { test } from "node:test";

import { DomainError } from "../domainError.ts";
import {
  dictationConfigured,
  MAX_AUDIO_BYTES,
  transcribe,
} from "./transcribe.ts";

const ENV = {
  ANTHROPIC_API_KEY: "a",
  CLOUDFLARE_AI_TOKEN: "t",
  CLOUDFLARE_ACCOUNT_ID: "konto",
};

function answering(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fake: typeof fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(body), { status });
  };
  return { fake, calls };
}

test("schickt die Aufnahme als Base64 mit dem Token an das eigene Konto", async () => {
  const { fake, calls } = answering(200, {
    result: { text: " la bagnole ", transcription_info: { duration: 1.25 } },
  });
  const result = await transcribe(new Blob(["abc"]), fake, ENV);
  assert.deepEqual(result, { text: "la bagnole", audioMs: 1250 });
  assert.match(calls[0].url, /accounts\/konto\/ai\/run\/@cf\/openai\/whisper/);
  assert.equal(
    (calls[0].init.headers as Record<string, string>).Authorization,
    "Bearer t",
  );
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { audio: "YWJj" });
});

test("eine leere oder zu lange Aufnahme geht gar nicht erst hinaus", async () => {
  const { fake, calls } = answering(200, {});
  await assert.rejects(transcribe(new Blob([]), fake, ENV), DomainError);
  const zuLang = new Blob([new Uint8Array(MAX_AUDIO_BYTES + 1)]);
  await assert.rejects(transcribe(zuLang, fake, ENV), DomainError);
  assert.equal(calls.length, 0);
});

test("ohne erkannten Text kommt eine Meldung, ein Fehler des Dienstes fliegt weiter", async () => {
  const leer = answering(200, { result: { text: "  " } });
  await assert.rejects(
    transcribe(new Blob(["a"]), leer.fake, ENV),
    DomainError,
  );
  const kaputt = answering(500, {});
  await assert.rejects(
    transcribe(new Blob(["a"]), kaputt.fake, ENV),
    (error) => !(error instanceof DomainError),
  );
});

test("das Diktat gibt es nur mit allen drei Schlüsseln", () => {
  assert.equal(dictationConfigured(ENV), true);
  assert.equal(dictationConfigured({ ...ENV, CLOUDFLARE_AI_TOKEN: "" }), false);
  assert.equal(dictationConfigured({}), false);
});
