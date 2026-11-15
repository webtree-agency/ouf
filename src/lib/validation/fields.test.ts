import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { z } from "zod";

import {
  countField,
  fieldMessages,
  normalizeTags,
  requiredEmailField,
  tagsField,
  textField,
} from "./fields.ts";

describe("textField", () => {
  it("macht leeren Text zu null", () => {
    assert.equal(textField().parse("   "), null);
  });

  it("schneidet Leerraum ab", () => {
    assert.equal(textField().parse("  la maison "), "la maison");
  });

  it("weist zu langen Text ab", () => {
    assert.equal(textField(3).safeParse("abcd").success, false);
  });
});

describe("requiredEmailField", () => {
  it("nimmt eine Adresse an und schreibt sie klein", () => {
    assert.equal(
      requiredEmailField().parse(" Jann@Beispiel.CH "),
      "jann@beispiel.ch",
    );
  });

  it("weist eine Adresse ohne @ mit der festen Meldung ab", () => {
    const result = requiredEmailField().safeParse("jann");
    assert.equal(result.success, false);
    assert.equal(
      result.error?.issues[0].message,
      "Das sieht nicht nach einer E-Mail-Adresse aus.",
    );
  });

  it("verlangt etwas", () => {
    assert.equal(requiredEmailField().safeParse("  ").success, false);
  });
});

describe("countField", () => {
  const field = countField("Neue Karten je Tag", 0, 999);

  it("liest eine Zahl", () => {
    assert.equal(field.parse(" 20 "), 20);
  });

  it("nimmt null an", () => {
    assert.equal(field.parse("0"), 0);
  });

  it("weist Zahlen ausserhalb ab", () => {
    assert.equal(field.safeParse("1000").success, false);
  });

  it("weist Brüche und Text ab", () => {
    assert.equal(field.safeParse("2.5").success, false);
    assert.equal(field.safeParse("zwanzig").success, false);
  });
});

describe("normalizeTags", () => {
  it("trennt an Komma und Leerzeichen, schreibt klein und nimmt jeden einmal", () => {
    assert.deepEqual(normalizeTags("Verb, #alltag  verb"), ["verb", "alltag"]);
  });

  it("gibt für leeren Text eine leere Liste", () => {
    assert.deepEqual(normalizeTags("  ,  "), []);
  });
});

describe("tagsField", () => {
  it("weist zu lange Tags ab", () => {
    assert.equal(tagsField().safeParse("a".repeat(41)).success, false);
  });
});

describe("fieldMessages", () => {
  it("nimmt je Feld den ersten Einwand", () => {
    const schema = z.object({
      front: z.string().min(1, "eins").min(2, "zwei"),
    });
    const result = schema.safeParse({ front: "" });
    assert.deepEqual(fieldMessages(result.error!), { front: "eins" });
  });
});
