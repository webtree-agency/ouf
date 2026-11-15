import type { Metadata } from "next";

import PageHeading from "@/components/common/PageHeading";
import LearnSession from "@/components/learn/LearnSession";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { studyState } from "@/lib/learning/session";
import { findDeck } from "@/lib/queries/decks";

export const metadata: Metadata = { title: "Lernen" };

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string }>;
}) {
  const { session, language } = await requireLanguage();
  const wanted = (await searchParams).deck;
  const deck =
    wanted && /^[0-9a-f-]{36}$/i.test(wanted)
      ? await findDeck(session.userId, wanted)
      : null;
  const deckId = deck && deck.languageId === language.id ? deck.id : null;

  const initial = await studyState({
    userId: session.userId,
    languageId: language.id,
    languageCode: language.code,
    deckId: deckId ?? undefined,
  });

  return (
    <>
      <PageHeading title={deck && deckId ? deck.name : "Alle Decks"} />
      <LearnSession key={deckId ?? "alle"} initial={initial} deckId={deckId} />
    </>
  );
}
