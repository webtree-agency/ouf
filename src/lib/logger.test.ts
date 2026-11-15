import assert from "node:assert/strict";
import { test } from "node:test";

import { formatLogLine } from "./logger.ts";

const TIME = new Date("2026-07-30T05:00:00.000Z");

test("schreibt eine Zeile JSON mit Zeit, Stufe und Meldung", () => {
  const line = formatLogLine("info", "Sitzung erstellt", undefined, TIME);

  assert.deepEqual(JSON.parse(line), {
    time: "2026-07-30T05:00:00.000Z",
    level: "info",
    message: "Sitzung erstellt",
  });
});

test("übernimmt den Zusammenhang als eigene Felder", () => {
  const line = formatLogLine("warn", "Mail verworfen", { to: "a@b.ch" }, TIME);

  assert.equal(JSON.parse(line).to, "a@b.ch");
});

test("behält Meldung und Stapel eines Fehlers", () => {
  const line = formatLogLine(
    "error",
    "Versand fehlgeschlagen",
    { error: new TypeError("kaputt") },
    TIME,
  );

  const { error } = JSON.parse(line);
  assert.equal(error.name, "TypeError");
  assert.equal(error.message, "kaputt");
  assert.match(error.stack, /kaputt/);
});

test("bleibt bei ringförmigen Daten schreibfähig", () => {
  const circular: Record<string, unknown> = {};
  circular.self = circular;

  const line = formatLogLine("error", "Alles im Kreis", circular, TIME);

  assert.equal(JSON.parse(line).message, "Alles im Kreis");
});
