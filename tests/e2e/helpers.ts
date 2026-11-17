import { expect, type Page } from "@playwright/test";

/** Ein Authenticator im Browser; ohne ihn gäbe es kein Touch ID zum Anklicken. */
export async function virtualAuthenticator(page: Page) {
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

/** Registrieren, Französisch wählen, ein Deck anlegen: der Weg jedes neuen Kontos. */
export async function newAccountWithDeck(page: Page, deck = "Grundwortschatz") {
  await virtualAuthenticator(page);
  await page.goto("/registrieren");
  await page.getByLabel("Name").fill("Jann");
  await page.getByLabel("E-Mail-Adresse").fill("jann@ouf.local");
  await page.getByRole("button", { name: "Passkey anlegen" }).click();

  await page.waitForURL(/\/sprachen$/);
  await page.getByRole("button", { name: "Hinzufügen" }).click();
  await page.waitForURL(/\/decks$/);

  await page.getByRole("button", { name: "Neues Deck" }).click();
  await page.getByLabel("Titel").fill(deck);
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("link", { name: deck })).toBeVisible();
}
