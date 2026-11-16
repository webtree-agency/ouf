import type { Metadata } from "next";

import PageHeading from "@/components/common/PageHeading";
import EnableReverse from "@/components/learn/EnableReverse";
import LearnOptions from "@/components/learn/LearnOptions";
import LearnSession from "@/components/learn/LearnSession";
import { deckLabel } from "@/lib/decks/label";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { filterFromParams, filterKey } from "@/lib/learning/filter";
import { countWithoutReverse } from "@/lib/learning/reverse";
import { studyState } from "@/lib/learning/session";
import { listDecks } from "@/lib/queries/decks";
import { listTags } from "@/lib/queries/tags";

export const metadata: Metadata = { title: "Lernen" };

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { session, language } = await requireLanguage();
  const [decks, tags] = await Promise.all([
    listDecks(session.userId, language.id),
    listTags(session.userId, language.id),
  ]);

  // Was aus der Adresse kommt, gilt nur, wenn es dem Konto gehört (§2).
  const wanted = filterFromParams(await searchParams);
  const deck = decks.find((entry) => entry.id === wanted.deckId);
  const filter = {
    ...wanted,
    deckId: deck?.id,
    tag: tags.some((tag) => tag.name === wanted.tag) ? wanted.tag : undefined,
    gender: language.genders ? wanted.gender : undefined,
  };
  const scope = {
    userId: session.userId,
    languageId: language.id,
    languageCode: language.code,
    filter,
  };
  const [initial, withoutReverse] = await Promise.all([
    studyState(scope),
    filter.direction === "zurueck" ? countWithoutReverse(scope) : 0,
  ]);

  return (
    <>
      <PageHeading title={deck ? deckLabel(deck) : "Lernen"} />
      <LearnOptions
        filter={filter}
        decks={decks.map((entry) => ({
          id: entry.id,
          label: deckLabel(entry),
        }))}
        tags={tags}
        genders={language.genders}
        languageName={language.name}
      />
      {withoutReverse > 0 && (
        <EnableReverse count={withoutReverse} filter={filter} />
      )}
      <LearnSession key={filterKey(filter)} initial={initial} filter={filter} />
    </>
  );
}
