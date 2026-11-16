"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/actionResult";
import { runAction, runActionWith } from "@/lib/actions/run";
import { DomainError } from "@/lib/domainError";
import { learnFilter, type LearnFilter } from "@/lib/learning/filter";
import { enableReverse } from "@/lib/learning/reverse";
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
  filter: learnFilter,
});

/** Ein Deck aus dem Filter zählt nur, wenn es dem Konto und der Sprache gehört. */
async function scope(userId: string, filter: LearnFilter) {
  const { active } = await activeLanguage(userId);
  if (!active) throw new DomainError("Es gibt noch keine Sprache.");
  const deck = filter.deckId ? await findDeck(userId, filter.deckId) : null;
  return {
    userId,
    languageId: active.id,
    languageCode: active.code,
    filter: {
      ...filter,
      deckId: deck && deck.languageId === active.id ? deck.id : undefined,
    },
  };
}

/** Bewertet und gibt gleich die nächste Karte zurück: ein Aufruf je Karte. */
export async function rate(input: z.input<typeof rateInput>) {
  const parsed = rateInput.parse(input);
  // Ohne Erneuern der Seite: Übersicht und Statistik werden bei jedem Aufruf frisch gerechnet.
  return runActionWith<StudyState>({}, async (actor) => {
    await rateCard({ userId: actor.id, ...parsed });
    return studyState(await scope(actor.id, parsed.filter));
  });
}

export async function undo(filter: z.input<typeof learnFilter>) {
  const parsedFilter = learnFilter.parse(filter);
  return runActionWith<StudyState>({}, async (actor) => {
    const where = await scope(actor.id, parsedFilter);
    const scheduleId = await undoLastReview(actor.id, where.languageId);
    return studyState(where, new Date(), scheduleId);
  });
}

/** „Für alle einschalten" bei Deutsch → Fremdsprache: alle Karten der Auswahl. */
export async function enableReverseAction(
  filter: z.input<typeof learnFilter>,
): Promise<ActionResult> {
  const parsedFilter = learnFilter.parse(filter);
  return runAction({ revalidate: ["/"] }, async (actor) => {
    await enableReverse(await scope(actor.id, parsedFilter));
  });
}
