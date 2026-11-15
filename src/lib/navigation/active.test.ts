import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { activeHref } from "./active.ts";

const hrefs = ["/", "/lernen", "/karten", "/decks"];

describe("activeHref", () => {
  it("markiert die Übersicht nur auf ihrem eigenen Pfad", () => {
    assert.equal(activeHref("/", hrefs), "/");
    assert.equal(activeHref("/konto", hrefs), null);
  });

  it("gibt Unterseiten ihrem Menüpunkt", () => {
    assert.equal(activeHref("/karten/neu", hrefs), "/karten");
  });

  it("verwechselt Namensanfänge nicht mit Pfadgrenzen", () => {
    assert.equal(activeHref("/kartenstapel", hrefs), null);
  });
});
