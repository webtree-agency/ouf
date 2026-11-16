import { expect, test } from "@playwright/test";

import { closeDb } from "../../src/db/index.ts";
import { setupTestDb, truncateAll } from "../../src/db/testing.ts";
import { applyE2eEnv } from "./env.ts";
import { virtualAuthenticator } from "./helpers.ts";

test.beforeAll(async () => {
  applyE2eEnv();
  await setupTestDb();
});
test.beforeEach(truncateAll);
test.afterAll(closeDb);

test("registrieren, abmelden, mit Passkey wieder anmelden", async ({
  page,
}) => {
  await virtualAuthenticator(page);

  await page.goto("/registrieren");

  await page.getByLabel("Name").fill("Jann");
  await page.getByLabel("E-Mail-Adresse").fill("jann@ouf.local");
  await page.getByRole("button", { name: "Passkey anlegen" }).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/registrieren"));
  await page.goto("/konto");
  await expect(page.getByText("Angemeldet als jann@ouf.local")).toBeVisible();
  await expect(page.getByText("Dieses Gerät")).toBeVisible();

  await page.getByRole("button", { name: /Jann/ }).click();
  await page.getByRole("button", { name: "Abmelden" }).click();
  await page.waitForURL(/\/anmelden/);

  await page.goto("/konto");
  await page.waitForURL(/\/anmelden\?weiter=%2Fkonto/);
  await page.getByRole("button", { name: "Mit Passkey anmelden" }).click();
  await page.waitForURL(/\/konto$/);
  await expect(page.getByText("Angemeldet als jann@ouf.local")).toBeVisible();
});

test("eine vergebene Adresse steht am Feld", async ({ page }) => {
  await virtualAuthenticator(page);
  await page.goto("/registrieren");
  await page.getByLabel("Name").fill("Jann");
  await page.getByLabel("E-Mail-Adresse").fill("jann@ouf.local");
  await page.getByRole("button", { name: "Passkey anlegen" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/registrieren"));
  await page.context().clearCookies();

  await page.goto("/registrieren");
  await page.getByLabel("Name").fill("Noch einmal");
  await page.getByLabel("E-Mail-Adresse").fill("Jann@ouf.local");
  await page.getByRole("button", { name: "Passkey anlegen" }).click();
  await expect(
    page.getByText("Für diese Adresse gibt es schon ein Konto."),
  ).toBeVisible();
  await expect(page.getByLabel("E-Mail-Adresse")).toBeFocused();
});

test("eine Adresse ausserhalb der Liste bekommt kein Konto", async ({
  page,
}) => {
  await virtualAuthenticator(page);
  await page.goto("/registrieren");
  await page.getByLabel("Name").fill("Fremd");
  await page.getByLabel("E-Mail-Adresse").fill("fremd@ouf.local");
  await page.getByRole("button", { name: "Passkey anlegen" }).click();
  await expect(
    page.getByText("Für diese Adresse ist kein Konto vorgesehen."),
  ).toBeVisible();
});
