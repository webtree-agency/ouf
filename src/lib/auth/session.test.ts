import assert from "node:assert/strict";
import { test } from "node:test";

import {
  FRESH_FACTOR_MS,
  hasFreshFactor,
  readCookies,
  type Session,
} from "./session.ts";

test("findet den gesuchten Wert zwischen mehreren Cookies", () => {
  const header = "theme=dark; ouf_session=abc123; other=1";

  assert.deepEqual(readCookies(header, "ouf_session"), ["abc123"]);
});

test("gibt ohne Kopfzeile und ohne Treffer nichts zurück", () => {
  assert.deepEqual(readCookies(null, "ouf_session"), []);
  assert.deepEqual(readCookies("theme=dark", "ouf_session"), []);
});

test("verwechselt keinen Namen, der nur so anfängt", () => {
  assert.deepEqual(readCookies("ouf_session_old=abc", "ouf_session"), []);
});

test("behandelt einen leeren Wert wie keinen", () => {
  assert.deepEqual(readCookies("ouf_session=", "ouf_session"), []);
});

test("gibt jeden gleichnamigen Cookie zurück, nicht nur den ersten", () => {
  // So sieht es aus, wenn ein Cookie für `app.ouf.example` und einer für
  // `.ouf.example` nebeneinander liegen: gleicher Name, andere Anmeldung.
  assert.deepEqual(
    readCookies("ouf_session=alt; theme=dark; ouf_session=neu", "ouf_session"),
    ["alt", "neu"],
  );
});

test("sieht sich nicht beliebig viele gleichnamige Cookies an", () => {
  // Jeder Wert kostet eine Abfrage, und den Kopf schreibt der Aufrufer.
  const header = Array.from({ length: 50 }, (_, i) => `ouf_session=t${i}`).join(
    "; ",
  );

  assert.deepEqual(readCookies(header, "ouf_session"), [
    "t0",
    "t1",
    "t2",
    "t3",
  ]);
});

test("übergeht einen Wert, den niemand mehr lesen kann", () => {
  assert.deepEqual(
    readCookies("ouf_session=%E0%A4%A; ouf_session=gut", "ouf_session"),
    ["gut"],
  );
});

test("entschlüsselt kodierte Zeichen im Wert", () => {
  assert.deepEqual(readCookies("ouf_session=a%2Bb", "ouf_session"), ["a+b"]);
});

function sessionVerifiedAt(verifiedAt: Date): Session {
  return {
    sessionId: "s1",
    userId: "u1",
    email: "jann@webtree.ch",
    name: "Jann",
    verifiedAt,
    expiresAt: new Date(),
  };
}

test("hält einen Faktor bis zu 15 Minuten für frisch", () => {
  const now = new Date("2026-07-30T12:00:00Z");
  const gerade = new Date(now.getTime() - FRESH_FACTOR_MS + 1000);

  assert.equal(hasFreshFactor(sessionVerifiedAt(gerade), now), true);
});

test("verlangt nach 15 Minuten einen neuen Faktor", () => {
  const now = new Date("2026-07-30T12:00:00Z");
  const zuAlt = new Date(now.getTime() - FRESH_FACTOR_MS - 1000);

  assert.equal(hasFreshFactor(sessionVerifiedAt(zuAlt), now), false);
});
