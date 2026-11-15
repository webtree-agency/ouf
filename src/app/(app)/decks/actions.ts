"use server";

import { z } from "zod";

import { failed, type ActionResult } from "@/lib/actionResult";
import { runAction } from "@/lib/actions/run";
import {
  createDeck,
  deckInput,
  deleteDeck,
  updateDeck,
} from "@/lib/decks/decks";
import { activeLanguage } from "@/lib/queries/languages";
import { fieldMessages } from "@/lib/validation/fields";

type DeckForm = { name: string; newPerDay: string };

function parse(input: DeckForm) {
  return deckInput.safeParse({
    name: String(input.name),
    newPerDay: String(input.newPerDay),
  });
}

export async function createDeckAction(input: DeckForm): Promise<ActionResult> {
  const parsed = parse(input);
  if (!parsed.success)
    return failed(
      "Bitte die markierten Felder prüfen.",
      fieldMessages(parsed.error),
    );

  return runAction({ revalidate: ["/"] }, async (actor) => {
    const { active } = await activeLanguage(actor.id);
    if (!active) return "/sprachen";
    await createDeck(actor.id, active.id, parsed.data);
  });
}

export async function updateDeckAction(
  deckId: string,
  input: DeckForm,
): Promise<ActionResult> {
  const parsed = parse(input);
  if (!parsed.success)
    return failed(
      "Bitte die markierten Felder prüfen.",
      fieldMessages(parsed.error),
    );
  return runAction({ revalidate: ["/"] }, (actor) =>
    updateDeck(actor.id, z.uuid().parse(deckId), parsed.data),
  );
}

export async function deleteDeckAction(deckId: string): Promise<ActionResult> {
  return runAction({ revalidate: ["/"] }, (actor) =>
    deleteDeck(actor.id, z.uuid().parse(deckId)),
  );
}
