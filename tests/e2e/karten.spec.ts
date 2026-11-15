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

test("Schnellerfassung: Vorderseite, Tab, Rückseite, Enter, und wieder vorne", async ({
  page,
}) => {
  await newAccountWithDeck(page);
  await page.getByRole("link", { name: "Erfassen" }).click();
  await page.waitForURL(/\/karten\/neu\?deck=/);

  const front = page.getByLabel("Vorderseite");
  await expect(front).toBeFocused();
  await front.fill("la maison");
  // Der Artikel setzt das Genus.
  await expect(page.getByRole("radio", { name: "weiblich" })).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Rückseite")).toBeFocused();
  await page.keyboard.type("das Haus");
  await page.keyboard.press("Enter");

  await expect(page.getByText("Gespeichert: la maison")).toBeVisible();
  await expect(page.getByLabel("Vorderseite")).toBeFocused();
  await expect(page.getByLabel("Vorderseite")).toHaveValue("");
  await expect(page.getByRole("link", { name: "la maison" })).toBeVisible();
  // Das Deck bleibt gewählt.
  await expect(page).toHaveURL(/\/karten\/neu\?deck=/);

  // Dieselbe Vorderseite meldet sich beim Tippen.
  await page.getByLabel("Vorderseite").fill("La Maison");
  await expect(
    page.getByText(/Gibt es schon: la maison · das Haus/),
  ).toBeVisible();
});

test("die Liste filtert über die Adresse, und Zurück bringt den Filter mit", async ({
  page,
}) => {
  await newAccountWithDeck(page);
  await page.goto("/karten/neu");
  for (const [front, back] of [
    ["le chat", "die Katze"],
    ["le chien", "der Hund"],
  ]) {
    await page.getByLabel("Vorderseite").fill(front);
    await page.getByLabel("Rückseite").fill(back);
    await page.keyboard.press("Enter");
    await expect(page.getByText(`Gespeichert: ${front}`)).toBeVisible();
  }

  await page.goto("/karten");
  await page.getByLabel("Suchen").fill("katze");
  await page.waitForURL(/suche=katze/);
  await expect(page.getByRole("link", { name: "le chien" })).toBeHidden();

  await page.getByRole("link", { name: "le chat" }).click();
  await page.waitForURL(/\/karten\/[0-9a-f-]+\?zurueck=/);
  await page.getByLabel("Rückseite").fill("die Katze, der Kater");
  await page.getByRole("button", { name: "Speichern" }).click();

  await page.waitForURL(/\/karten\?suche=katze$/);
  await expect(page.getByText("die Katze, der Kater")).toBeVisible();
});
