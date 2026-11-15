import assert from "node:assert/strict";
import { test } from "node:test";

import { SESSION_EXPIRED } from "../actionResult.ts";
import { NotAuthenticatedError } from "../auth/errors.ts";
import { DomainError } from "../domainError.ts";
import { answerFor, answerOrThrow } from "./answer.ts";

test("eine abgelaufene Sitzung bekommt den Weg zur Anmeldung", () => {
  assert.deepEqual(answerFor(new NotAuthenticatedError()), SESSION_EXPIRED);
});

test("ein Fachfehler wird zur Meldung am Feld", () => {
  assert.deepEqual(answerFor(new DomainError("Gibt es schon.", "name")), {
    ok: false,
    message: "Gibt es schon.",
    fields: { name: "Gibt es schon." },
  });
});

test("ein Fachfehler ohne Feld steht über dem Formular", () => {
  const result = answerFor(new DomainError("Nicht gefunden."));
  assert.equal(result?.ok, false);
  assert.equal(result && !result.ok ? result.fields : "x", undefined);
});

test("alles andere fliegt weiter", () => {
  const fehler = new Error("Datenbank weg");
  assert.equal(answerFor(fehler), null);
  assert.throws(() => answerOrThrow(fehler), fehler);
});
