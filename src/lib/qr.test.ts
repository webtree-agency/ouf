import assert from "node:assert/strict";
import { test } from "node:test";

import { qrDataUri } from "./qr.ts";

const URI =
  "otpauth://totp/Webtree%20Cockpit:jann@webtree.ch?secret=JBSWY3DPEHPK3PXP&issuer=Webtree%20Cockpit";

function svgOf(dataUri: string): string {
  return Buffer.from(dataUri.split(",")[1], "base64").toString("utf8");
}

test("liefert ein SVG als Bild-Adresse", () => {
  const result = qrDataUri(URI);

  assert.ok(result.startsWith("data:image/svg+xml;base64,"));
  assert.match(svgOf(result), /^<svg/);
});

test("bringt eine weisse Fläche mit", () => {
  // Ohne sie wäre der Code im dunklen Modus dunkel auf dunkel — nicht scannbar.
  assert.match(svgOf(qrDataUri(URI)), /fill="white"/);
});

test("wächst mit dem Inhalt", () => {
  const kurz = svgOf(qrDataUri("otpauth://totp/a?secret=AB"));
  const lang = svgOf(qrDataUri(URI));

  assert.ok(lang.length > kurz.length);
});

test("derselbe Inhalt ergibt denselben Code", () => {
  assert.equal(qrDataUri(URI), qrDataUri(URI));
});
