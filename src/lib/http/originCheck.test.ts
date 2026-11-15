import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { crossOriginRejected } from "./originCheck.ts";

const base = { host: "ouf.example", origin: null, secFetchSite: null };

describe("crossOriginRejected", () => {
  it("lässt lesende Anfragen immer durch", () => {
    assert.equal(
      crossOriginRejected({
        ...base,
        method: "GET",
        secFetchSite: "cross-site",
      }),
      false,
    );
  });

  it("weist einen Post von einer fremden Seite ab", () => {
    assert.equal(
      crossOriginRejected({
        ...base,
        method: "POST",
        secFetchSite: "same-site",
      }),
      true,
    );
  });

  it("nimmt einen Post von der eigenen Herkunft an", () => {
    assert.equal(
      crossOriginRejected({
        ...base,
        method: "POST",
        secFetchSite: "same-origin",
      }),
      false,
    );
  });

  it("vergleicht ohne Sec-Fetch-Site den Origin mit dem Namen", () => {
    assert.equal(
      crossOriginRejected({
        ...base,
        method: "POST",
        origin: "https://boese.example",
      }),
      true,
    );
    assert.equal(
      crossOriginRejected({
        ...base,
        method: "POST",
        origin: "https://ouf.example",
      }),
      false,
    );
  });

  it("lässt eine Anfrage ohne Browser-Kopfzeilen durch", () => {
    assert.equal(crossOriginRejected({ ...base, method: "POST" }), false);
  });
});
