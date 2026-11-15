import type { Metadata } from "next";

import QuickAdd from "@/components/cards/QuickAdd";
import RecentCards from "@/components/cards/RecentCards";
import ComponentCard from "@/components/common/ComponentCard";
import PageHeading from "@/components/common/PageHeading";
import NewDeckButton from "@/components/decks/NewDeckButton";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { recentCards } from "@/lib/queries/cards";
import { listDecks } from "@/lib/queries/decks";

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

  const recent = await recentCards(session.userId, deck.id);

  return (
    <>
      <PageHeading title="Karte erfassen" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ComponentCard>
            <QuickAdd
              decks={decks.map((entry) => ({
                value: entry.id,
                label: entry.name,
              }))}
              deckId={deck.id}
              genders={language.genders}
            />
          </ComponentCard>
        </div>
        <RecentCards cards={recent} />
      </div>
    </>
  );
}
