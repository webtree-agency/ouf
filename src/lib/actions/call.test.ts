import assert from "node:assert/strict";
import { test } from "node:test";

import { OK } from "../actionResult.ts";
import { callAction } from "./call.ts";

test("gibt das Ergebnis einer geglückten Aktion weiter", async () => {
  assert.deepEqual(await callAction(async () => OK), OK);
});

test("macht aus einer Ausnahme eine Meldung samt Kennung", async () => {
  const result = await callAction(async () => {
    throw Object.assign(new Error("weg"), { digest: "123" });
  });
  assert.equal(result.ok, false);
  assert.match(!result.ok ? result.message : "", /Kennung: 123\./);
});

test("lässt eine Weiterleitung durch", async () => {
  const redirect = Object.assign(new Error("NEXT_REDIRECT"), {
    digest: "NEXT_REDIRECT;replace;/karten;307;",
  });
  await assert.rejects(
    callAction(async () => {
      throw redirect;
    }),
    redirect,
  );
});
