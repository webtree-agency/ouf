"use server";

import { z } from "zod";

import { failed, type ActionResult } from "@/lib/actionResult";
import { runAction } from "@/lib/actions/run";
import { createCard, deleteCard, updateCard } from "@/lib/cards/cards";
import { cardInput, type CardDraft } from "@/lib/cards/input";
import { fieldMessages } from "@/lib/validation/fields";

function parse(draft: CardDraft) {
  return cardInput.safeParse(draft);
}

const PRUEFEN = "Bitte die markierten Felder prüfen.";

/**
 * Die Schnellerfassung bleibt auf der Seite: Der Fokus muss zurück auf die
 * Vorderseite, und die Liste darunter kommt mit derselben Antwort (§2).
 */
export async function createCardAction(
  draft: CardDraft,
): Promise<ActionResult> {
  const parsed = parse(draft);
  if (!parsed.success) return failed(PRUEFEN, fieldMessages(parsed.error));
  return runAction({ revalidate: ["/"] }, async (actor) => {
    await createCard(actor.id, parsed.data);
  });
}

/** Zurück geht es in die Liste, aus der man kam, mit ihrem Filter. */
function backTo(target: string): string {
  return /^\/karten(\?[^\s]*)?$/.test(target) ? target : "/karten";
}

export async function updateCardAction(
  cardId: string,
  draft: CardDraft,
  back: string,
): Promise<ActionResult> {
  const parsed = parse(draft);
  if (!parsed.success) return failed(PRUEFEN, fieldMessages(parsed.error));
  return runAction({ revalidate: ["/"] }, async (actor) => {
    await updateCard(actor.id, z.uuid().parse(cardId), parsed.data);
    return backTo(String(back));
  });
}

export async function deleteCardAction(
  cardId: string,
  back: string,
): Promise<ActionResult> {
  return runAction({ revalidate: ["/"] }, async (actor) => {
    await deleteCard(actor.id, z.uuid().parse(cardId));
    return backTo(String(back));
  });
}
