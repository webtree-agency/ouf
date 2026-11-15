import { expect, test } from "@playwright/test";

import { closeDb } from "../../src/db/index.ts";
import { setupTestDb, truncateAll } from "../../src/db/testing.ts";
import { applyE2eEnv } from "./env.ts";
import { newAccountWithDeck } from "./helpers.ts";

test.beforeAll(async () => {
  applyE2eEnv();
  await setupTestDb();
});
test.beforeEach(truncateAll);
test.afterAll(closeDb);

test("eine Lernrunde: aufdecken, bewerten, zurücknehmen, fertig", async ({
  page,
}) => {
  await newAccountWithDeck(page);
  await page.goto("/karten/neu");
  for (const [front, back] of [
    ["la maison", "das Haus"],
    ["le chat", "die Katze"],
  ]) {
    await page.getByLabel("Vorderseite").fill(front);
    await page.getByLabel("Rückseite").fill(back);
    await page.keyboard.press("Enter");
    await expect(page.getByText(`Gespeichert: ${front}`)).toBeVisible();
  }

  await page.goto("/lernen");
  await expect(page.getByText("2 neu")).toBeVisible();
  await expect(page.getByText("la maison")).toBeVisible();
  await expect(page.getByText("das Haus")).toBeHidden();

  // Leertaste deckt auf, die Knöpfe zeigen das nächste Intervall.
  await page.keyboard.press(" ");
  await expect(page.getByText("das Haus")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Gut\s*10 Min/ }),
  ).toBeVisible();

  // Leicht: aus den Lernschritten heraus, die nächste Karte kommt.
  await page.keyboard.press("4");
  await expect(page.getByText("le chat")).toBeVisible();
  await expect(page.getByText("1 neu")).toBeVisible();

  // Z nimmt die letzte Bewertung zurück, die Karte kommt verdeckt wieder.
  await page.keyboard.press("z");
  await expect(page.getByText("la maison")).toBeVisible();
  await expect(page.getByText("2 neu")).toBeVisible();

  await page.getByRole("button", { name: "Aufdecken" }).click();
  await page.getByRole("button", { name: /Leicht/ }).click();
  await expect(page.getByText("le chat")).toBeVisible();
  await page.keyboard.press(" ");
  await page.keyboard.press("4");

  await expect(page.getByText("Für heute ist alles gelernt.")).toBeVisible();
});
