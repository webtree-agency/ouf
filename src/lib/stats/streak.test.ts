import assert from "node:assert/strict";
import { test } from "node:test";

import { streak } from "./streak.ts";

test("zählt heute und die Tage davor ohne Lücke", () => {
  assert.equal(
    streak(["2026-11-14", "2026-11-15", "2026-11-16"], "2026-11-16"),
    3,
  );
});

test("hält die Serie bis gestern, solange heute noch nicht gelernt ist", () => {
  assert.equal(streak(["2026-11-14", "2026-11-15"], "2026-11-16"), 2);
});

test("bricht an der ersten Lücke ab", () => {
  assert.equal(
    streak(["2026-11-12", "2026-11-14", "2026-11-15"], "2026-11-15"),
    2,
  );
});

test("ist null, wenn gestern und heute nichts gelernt wurde", () => {
  assert.equal(streak(["2026-11-13"], "2026-11-16"), 0);
  assert.equal(streak([], "2026-11-16"), 0);
});

test("geht über den Monatswechsel und die Zeitumstellung", () => {
  assert.equal(
    streak(
      ["2026-10-24", "2026-10-25", "2026-10-26", "2026-10-31", "2026-11-01"],
      "2026-11-01",
    ),
    2,
  );
  assert.equal(
    streak(["2026-10-24", "2026-10-25", "2026-10-26"], "2026-10-26"),
    3,
  );
});
