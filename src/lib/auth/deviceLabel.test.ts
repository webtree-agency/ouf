import assert from "node:assert/strict";
import { test } from "node:test";

import { describeDevice } from "./deviceLabel.ts";

test("erkennt Safari auf dem Mac", () => {
  assert.equal(
    describeDevice(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    ),
    "Safari, Macintosh",
  );
});

test("hält Chrome und Edge auseinander, obwohl beide Safari nennen", () => {
  const chrome =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
  const edge = `${chrome} Edg/141.0.0.0`;

  assert.equal(describeDevice(chrome), "Chrome, Windows NT 10.0");
  assert.equal(describeDevice(edge), "Edge, Windows NT 10.0");
});

test("erkennt Firefox", () => {
  assert.equal(
    describeDevice(
      "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
    ),
    "Firefox, X11",
  );
});

test("kommt ohne User-Agent und mit unbekanntem Programm zurecht", () => {
  assert.equal(describeDevice(null), "Unbekanntes Gerät");
  assert.equal(describeDevice("curl/8.7.1"), "Unbekanntes Gerät");
});
