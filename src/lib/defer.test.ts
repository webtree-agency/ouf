import assert from "node:assert/strict";
import { test } from "node:test";

import { afterResponse, runAfter, withDefer, type Defer } from "./defer.ts";

function sammler() {
  const offen: (() => Promise<void>)[] = [];
  const defer: Defer = (task) => offen.push(task);
  return { offen, defer };
}

test("ohne Weiche wird gewartet, wie in Cron und Skript", async () => {
  let fertig = false;
  await afterResponse(async () => {
    fertig = true;
  });
  assert.equal(fertig, true);
});

test("hinter der Weiche läuft die Arbeit erst nach der Antwort", async () => {
  const { offen, defer } = sammler();
  let fertig = false;
  await withDefer(defer, () =>
    afterResponse(async () => {
      fertig = true;
    }),
  );
  assert.equal(fertig, false);
  await offen[0]();
  assert.equal(fertig, true);
});

test("was danach läuft, stellt sich nicht noch einmal hinten an", async () => {
  const { offen, defer } = sammler();
  let innen = false;
  await withDefer(defer, () =>
    afterResponse(async () => {
      await afterResponse(async () => {
        innen = true;
      });
    }),
  );
  await offen[0]();
  assert.equal(innen, true);
  assert.equal(offen.length, 1);
});

test("ein Fehler danach reisst nichts mit", async () => {
  const { offen, defer } = sammler();
  await withDefer(defer, () =>
    afterResponse(async () => {
      throw new Error("ClickUp antwortet nicht");
    }),
  );
  await offen[0]();
});

test("eine ausdrücklich mitgegebene Weiche gilt auch ohne Eingang", async () => {
  const { offen, defer } = sammler();
  await runAfter(defer, async () => {});
  assert.equal(offen.length, 1);
});

test("mehrere Aufgaben einer Aktion laufen nacheinander, in ihrer Reihenfolge", async () => {
  const { offen, defer } = sammler();
  const spur: string[] = [];
  await withDefer(defer, async () => {
    await afterResponse(async () => {
      await new Promise((r) => setTimeout(r, 10));
      spur.push("discord");
    });
    await afterResponse(async () => {
      spur.push("clickup");
    });
  });
  assert.equal(offen.length, 1);
  await offen[0]();
  assert.deepEqual(spur, ["discord", "clickup"]);
});
