import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createRecoveryCodes,
  hashRecoveryCode,
  normaliseRecoveryCode,
  RECOVERY_CODE_COUNT,
} from "./recoveryCodes.ts";

test("erzeugt zehn verschiedene Codes im lesbaren Format", () => {
  const codes = createRecoveryCodes();

  assert.equal(codes.length, RECOVERY_CODE_COUNT);
  assert.equal(new Set(codes).size, RECOVERY_CODE_COUNT);
  for (const code of codes) {
    assert.match(code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  }
});

test("lässt die Zeichen weg, die beim Abtippen verwechselt werden", () => {
  const codes = createRecoveryCodes().join("");

  for (const verwechselbar of ["0", "O", "1", "I", "L"]) {
    assert.equal(codes.includes(verwechselbar), false, verwechselbar);
  }
});

test("nimmt Kleinschreibung und fehlende Bindestriche als denselben Code", () => {
  assert.equal(normaliseRecoveryCode("abcd-efgh-jkmn"), "ABCD-EFGH-JKMN");
  assert.equal(normaliseRecoveryCode("abcdefghjkmn"), "ABCD-EFGH-JKMN");
  assert.equal(normaliseRecoveryCode(" ABCD EFGH JKMN "), "ABCD-EFGH-JKMN");
});

test("hasht denselben Code trotz Tippweise gleich", () => {
  assert.equal(
    hashRecoveryCode("abcdefghjkmn"),
    hashRecoveryCode("ABCD-EFGH-JKMN"),
  );
  assert.notEqual(
    hashRecoveryCode("ABCD-EFGH-JKMN"),
    hashRecoveryCode("ABCD-EFGH-JKMP"),
  );
});
