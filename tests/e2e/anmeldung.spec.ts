import { expect, test, type Page } from "@playwright/test";

import { closeDb } from "../../src/db/index.ts";
import { setupTestDb, truncateAll } from "../../src/db/testing.ts";
import { applyE2eEnv } from "./env.ts";

test.beforeAll(async () => {
  applyE2eEnv();
  await setupTestDb();
});
test.beforeEach(truncateAll);
test.afterAll(closeDb);

/** Ein Authenticator im Browser; ohne ihn gäbe es kein Touch ID zum Anklicken. */
async function virtualAuthenticator(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("WebAuthn.enable");
  await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
}

test("registrieren, abmelden, mit Passkey wieder anmelden", async ({
  page,
}) => {
  await virtualAuthenticator(page);

  await page.goto("/");
  await page.waitForURL(/\/anmelden/);
  await page.getByRole("link", { name: "Konto anlegen" }).click();

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
