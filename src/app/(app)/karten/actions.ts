"use server";

import { z } from "zod";

import {
  failed,
  type ActionFailure,
  type ActionResult,
} from "@/lib/actionResult";
import { runAction, runActionWith } from "@/lib/actions/run";
import { cardFromText, exampleFor, transcribeFor } from "@/lib/capture/assist";
import type { CardSuggestion } from "@/lib/capture/suggest";
import { createCard, deleteCard, updateCard } from "@/lib/cards/cards";
import { cardInput, type CardDraft } from "@/lib/cards/input";
import { DomainError } from "@/lib/domainError";
import { activeLanguage } from "@/lib/queries/languages";
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

const assistInput = z.object({
  text: z.string().trim().min(1).max(500),
});

const exampleInput = z.object({
  front: z.string().trim().min(1).max(500),
  back: z.string().trim().max(500),
  previous: z.string().trim().max(1000),
});

function refused(message: string): ActionFailure {
  return { ok: false, message };
}

async function language(userId: string) {
  const { active } = await activeLanguage(userId);
  if (!active) throw new DomainError("Es gibt noch keine Sprache.");
  return active;
}

/** Diktat, erster Schritt: die Abschrift, die gleich grau in der Karte steht. */
export async function transcribeAction(form: FormData) {
  return runActionWith<string>({}, async (actor) => {
    const audio = form.get("audio");
    if (!(audio instanceof Blob))
      throw new DomainError("Es kam keine Aufnahme an.");
    return transcribeFor(actor.id, audio);
  });
}

/** Vorder- und Rückseite und Genus vorschlagen, aus Diktat oder Getipptem. */
export async function suggestCardAction(input: { text: string }) {
  const parsed = assistInput.safeParse(input);
  if (!parsed.success) return refused("Es steht noch nichts da.");
  return runActionWith<CardSuggestion>({}, async (actor) =>
    cardFromText(actor.id, parsed.data.text, await language(actor.id)),
  );
}

/** Ein Beispielsatz nur auf Wunsch; ein zweiter Klick schlägt einen anderen vor. */
export async function suggestExampleAction(
  input: z.input<typeof exampleInput>,
) {
  const parsed = exampleInput.safeParse(input);
  if (!parsed.success) return refused("Zuerst die Vorderseite.");
  return runActionWith<string>({}, async (actor) =>
    exampleFor(actor.id, parsed.data, await language(actor.id)),
  );
}
