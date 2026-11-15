import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";

const BEREICHE = ["src/app/(app)"];

// Jede Seite hat ein `loading.tsx` im eigenen Segment (§3); eine, die nur weiterleitet, nicht.
test("jede Seite hat ein loading.tsx im eigenen Segment", () => {
  const seiten = BEREICHE.flatMap(pages);
  assert.ok(seiten.length >= 1, "Es sollten alle Seiten gefunden werden");

  const ohne = seiten
    .filter((seite) => !leitetNurWeiter(seite))
    .filter((seite) => !existsSync(join(dirname(seite), "loading.tsx")))
    .map((seite) => dirname(seite));

  assert.deepEqual(
    ohne,
    [],
    `Diesen Seiten fehlt ein loading.tsx — eine Zeile aus ui/skeleton/PageSkeleton.tsx genügt:\n${ohne.join("\n")}`,
  );
});

function leitetNurWeiter(seite: string): boolean {
  const quelle = readFileSync(seite, "utf8");
  return quelle.includes("redirect(") && !/return \(|return </.test(quelle);
}

function pages(dir: string): string[] {
  return dateienNamens(dir, "page.tsx");
}

// Ein Skelett hat dieselbe Breite wie seine Seite; die Shell begrenzt sie einmal (§3).
test("kein Skelett begrenzt seine Breite selbst", () => {
  const dateien = [
    ...readdirSync("src/components/ui/skeleton")
      .filter((name) => name.endsWith(".tsx"))
      .map((name) => join("src/components/ui/skeleton", name)),
    ...BEREICHE.flatMap((dir) => dateienNamens(dir, "loading.tsx")),
  ];
  const begrenzt = dateien.filter((datei) =>
    /\b(max-w-|mx-auto)/.test(readFileSync(datei, "utf8")),
  );
  assert.deepEqual(
    begrenzt,
    [],
    `Diese Skelette setzen eine eigene Breite — die Shell tut das schon:\n${begrenzt.join("\n")}`,
  );
});

function dateienNamens(dir: string, name: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((eintrag) => {
    const pfad = join(dir, eintrag.name);
    if (eintrag.isDirectory()) return dateienNamens(pfad, name);
    return eintrag.name === name ? [pfad] : [];
  });
}
