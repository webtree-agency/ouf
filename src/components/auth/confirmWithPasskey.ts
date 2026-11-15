"use client"; // Der Passkey-Dialog läuft im Browser.

import { startAuthentication } from "@simplewebauthn/browser";

import {
  reconfirm,
  reconfirmLocally,
  reconfirmOptions,
} from "@/app/(app)/konto/actions";
import { failed, type ActionResult } from "@/lib/actionResult";

/** Der Dialog samt Serverprüfung. Ein Abbruch im Dialog ist ein Fehler wie jeder andere. */
export async function confirmWithPasskey(): Promise<ActionResult> {
  // Lokal gibt es keinen Passkey — dort bestätigt der Server selbst, unter
  // denselben Bedingungen wie beim Dev-Login. In der Produktion schlägt der
  // Versuch immer fehl und der Dialog übernimmt.
  const lokal = await reconfirmLocally();
  if (lokal.ok) return lokal;

  try {
    const options = await reconfirmOptions();
    return await reconfirm(await startAuthentication({ optionsJSON: options }));
  } catch {
    return failed("Die Bestätigung wurde abgebrochen.");
  }
}
