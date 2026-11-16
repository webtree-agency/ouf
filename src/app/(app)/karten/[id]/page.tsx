import type { Metadata } from "next";

import { deckLabel } from "@/lib/decks/label";
import { notFound } from "next/navigation";

import CardEditForm from "@/components/cards/CardEditForm";
import DeleteCard from "@/components/cards/DeleteCard";
import ComponentCard from "@/components/common/ComponentCard";
import PageHeading from "@/components/common/PageHeading";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { findCard } from "@/lib/queries/cards";
import { listDecks } from "@/lib/queries/decks";
import { listTags } from "@/lib/queries/tags";

export const metadata: Metadata = { title: "Karte bearbeiten" };

export default async function CardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zurueck?: string }>;
}) {
  const { session, language } = await requireLanguage();
  const { id } = await params;
  const card = /^[0-9a-f-]{36}$/i.test(id)
    ? await findCard(session.userId, id)
    : null;
  if (!card || card.languageId !== language.id) notFound();

  const zurueck = (await searchParams).zurueck;
  const back =
    zurueck && /^\/karten(\?\S*)?$/.test(zurueck) ? zurueck : "/karten";
  const [decks, tags] = await Promise.all([
    listDecks(session.userId, language.id),
    listTags(session.userId, language.id),
  ]);

  return (
    <>
      <PageHeading
        title={card.front}
        action={
          <DeleteCard cardId={card.id} front={card.front} returnTo={back} />
        }
      />
      <ComponentCard>
        <CardEditForm
          key={card.updatedAt.toISOString()}
          cardId={card.id}
          back={back}
          genders={language.genders}
          languageName={language.name}
          tagOptions={tags}
          decks={decks.map((deck) => ({
            value: deck.id,
            label: deckLabel(deck),
          }))}
          initial={{
            deckId: card.deckId,
            front: card.front,
            back: card.back,
            example: card.example ?? "",
            note: card.note ?? "",
            gender: card.gender ?? "",
            genderTouched: true,
            tags: card.tags.join(", "),
            reverse: card.reverse,
          }}
        />
      </ComponentCard>
    </>
  );
}
