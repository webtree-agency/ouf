import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDate, formatDateTime } from "./dateTime.ts";

test("schreibt Tag und Zeit in Zürcher Zeit", () => {
  const date = new Date("2026-11-15T22:40:00Z");
  assert.equal(formatDate(date), "15.11.2026");
  assert.equal(formatDateTime(date), "15.11.2026, 23:40");
});

test("nimmt nach Mitternacht in Zürich schon den nächsten Tag", () => {
  assert.equal(formatDate(new Date("2026-11-15T23:30:00Z")), "16.11.2026");
});
