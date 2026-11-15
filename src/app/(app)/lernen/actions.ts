"use server";

import { z } from "zod";

import { runActionWith } from "@/lib/actions/run";
import { DomainError } from "@/lib/domainError";
import {
  rateCard,
  studyState,
  undoLastReview,
  type StudyState,
} from "@/lib/learning/session";
import { findDeck } from "@/lib/queries/decks";
import { activeLanguage } from "@/lib/queries/languages";

const rateInput = z.object({
  scheduleId: z.uuid(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  reps: z.number().int().min(0),
  durationMs: z.number().min(0),
  deckId: z.uuid().nullable(),
});

async function scope(userId: string, deckId: string | null) {
  const { active } = await activeLanguage(userId);
  if (!active) throw new DomainError("Es gibt noch keine Sprache.");
  const deck = deckId ? await findDeck(userId, deckId) : null;
  return {
    userId,
    languageId: active.id,
    languageCode: active.code,
    deckId: deck && deck.languageId === active.id ? deck.id : undefined,
  };
}

/** Bewertet und gibt gleich die nächste Karte zurück: ein Aufruf je Karte. */
export async function rate(input: z.input<typeof rateInput>) {
  const parsed = rateInput.parse(input);
  // Ohne Erneuern der Seite: Übersicht und Statistik werden bei jedem Aufruf frisch gerechnet.
  return runActionWith<StudyState>({}, async (actor) => {
    await rateCard({ userId: actor.id, ...parsed });
    return studyState(await scope(actor.id, parsed.deckId));
  });
}

export async function undo(deckId: string | null) {
  const parsedDeck = z.uuid().nullable().parse(deckId);
  return runActionWith<StudyState>({}, async (actor) => {
    const where = await scope(actor.id, parsedDeck);
    const scheduleId = await undoLastReview(actor.id, where.languageId);
    return studyState(where, new Date(), scheduleId);
  });
}
