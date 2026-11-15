import assert from "node:assert/strict";
import { test } from "node:test";

import { SECURITY_HEADERS } from "./securityHeaders.ts";

test("verbietet Suchmaschinen jede Spur", () => {
  assert.equal(
    SECURITY_HEADERS["X-Robots-Tag"],
    "noindex, nofollow, noarchive, nosnippet",
  );
});

test("lässt sich nirgends einbetten und gibt keinen Referer weiter", () => {
  assert.equal(SECURITY_HEADERS["X-Frame-Options"], "DENY");
  assert.equal(
    SECURITY_HEADERS["Content-Security-Policy"],
    "frame-ancestors 'none'",
  );
  assert.equal(SECURITY_HEADERS["Referrer-Policy"], "no-referrer");
});
