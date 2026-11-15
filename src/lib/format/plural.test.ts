import assert from "node:assert/strict";
import { test } from "node:test";

import { counted } from "./plural.ts";

const PROJEKTE = { one: "Projekt", many: "Projekte" };

test("eines bekommt die Einzahl, alles andere die Mehrzahl", () => {
  assert.equal(counted(1, PROJEKTE), "1 Projekt");
  assert.equal(counted(2, PROJEKTE), "2 Projekte");
  assert.equal(counted(0, PROJEKTE), "0 Projekte");
});
