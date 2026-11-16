import type { Metadata } from "next";

import PageHeading from "@/components/common/PageHeading";
import DeckList from "@/components/decks/DeckList";
import NewDeckButton from "@/components/decks/NewDeckButton";
import Button from "@/components/ui/button/Button";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { listDecks } from "@/lib/queries/decks";

export const metadata: Metadata = { title: "Decks" };

export default async function DecksPage() {
  const { session, language } = await requireLanguage();
  const decks = await listDecks(session.userId, language.id);

  return (
    <>
      <PageHeading
        title="Decks"
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" href="/decks/tags">
              Tags
            </Button>
            {decks.length > 0 && <NewDeckButton variant="outline" />}
          </div>
        }
      />
      <DeckList decks={decks} languageName={language.name} />
    </>
  );
}
