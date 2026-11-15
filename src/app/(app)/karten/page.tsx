import type { Metadata } from "next";

import CardFilters from "@/components/cards/CardFilters";
import CardList from "@/components/cards/CardList";
import PageHeading from "@/components/common/PageHeading";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { listCards, listTags } from "@/lib/queries/cards";
import { listDecks } from "@/lib/queries/decks";
import { perPageFrom } from "@/lib/queries/paginate";

export const metadata: Metadata = { title: "Karten" };

type Params = {
  suche?: string;
  deck?: string;
  tag?: string;
  genus?: string;
  seite?: string;
  "pro-seite"?: string;
};

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { session, language } = await requireLanguage();
  const params = await searchParams;
  const [decks, tags] = await Promise.all([
    listDecks(session.userId, language.id),
    listTags(session.userId, language.id),
  ]);

  // Was aus der Adresse kommt, wird geprüft, bevor es in die Abfrage geht (§2).
  const deckId = decks.some((deck) => deck.id === params.deck)
    ? params.deck
    : undefined;
  const tag = params.tag && tags.includes(params.tag) ? params.tag : undefined;
  const gender =
    language.genders && (params.genus === "m" || params.genus === "f")
      ? params.genus
      : undefined;
  const query = params.suche?.slice(0, 100);

  const result = await listCards(session.userId, language.id, {
    query,
    deckId,
    tag,
    gender,
    page: Number(params.seite) || 1,
    perPage: perPageFrom(params["pro-seite"]),
  });

  const listHref = `/karten${toQuery(params)}`;
  const neu = deckId ? `/karten/neu?deck=${deckId}` : "/karten/neu";

  return (
    <>
      <PageHeading
        title="Karten"
        action={
          <Button href={neu} startIcon={<PlusIcon />}>
            Karte erfassen
          </Button>
        }
      />
      <div className="space-y-6">
        <CardFilters
          decks={decks.map((deck) => ({ value: deck.id, label: deck.name }))}
          tags={tags}
          genders={language.genders}
        />
        <CardList
          {...result}
          listHref={listHref}
          filtered={Boolean(query || deckId || tag || gender)}
        />
      </div>
    </>
  );
}

function toQuery(params: Params): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value) search.set(key, value);
  return search.size ? `?${search}` : "";
}
