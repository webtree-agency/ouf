import type { Metadata } from "next";

import QuickAdd from "@/components/cards/QuickAdd";
import RecentCards from "@/components/cards/RecentCards";
import ComponentCard from "@/components/common/ComponentCard";
import PageHeading from "@/components/common/PageHeading";
import NewDeckButton from "@/components/decks/NewDeckButton";
import { dictationConfigured } from "@/lib/capture/transcribe";
import { deckLabel } from "@/lib/decks/label";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { recentCards } from "@/lib/queries/cards";
import { listDecks } from "@/lib/queries/decks";
import { listTags } from "@/lib/queries/tags";

export const metadata: Metadata = { title: "Karte erfassen" };

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string }>;
}) {
  const { session, language } = await requireLanguage();
  const decks = await listDecks(session.userId, language.id);
  const wanted = (await searchParams).deck;
  const deck = decks.find((entry) => entry.id === wanted) ?? decks[0];

  if (!deck) {
    return (
      <>
        <PageHeading title="Karte erfassen" />
        <ComponentCard>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Karten liegen in einem Deck. Zuerst eines anlegen.
          </p>
          <NewDeckButton />
        </ComponentCard>
      </>
    );
  }

  const [recent, tags] = await Promise.all([
    recentCards(session.userId, deck.id),
    listTags(session.userId, language.id),
  ]);

  return (
    <>
      <PageHeading title="Karte erfassen" />
      <QuickAdd
        decks={decks.map((entry) => ({
          value: entry.id,
          label: deckLabel(entry),
        }))}
        deckId={deck.id}
        genders={language.genders}
        language={language.name}
        dictation={dictationConfigured() ? language.name : null}
        tagOptions={tags}
        aside={<RecentCards cards={recent} />}
      />
    </>
  );
}
