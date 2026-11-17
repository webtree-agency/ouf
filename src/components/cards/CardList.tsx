import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import ListFooter from "@/components/common/ListFooter";
import PerPageSelect from "@/components/common/PerPageSelect";
import TagChip, { lookOf } from "@/components/tags/TagChip";
import Badge from "@/components/ui/badge/Badge";
import { PencilIcon } from "@/icons";
import { GENDER_LABELS } from "@/lib/languages/catalog";
import { listSummary } from "@/lib/format/listSummary";
import type { CardRow } from "@/lib/queries/cards";
import type { TagLook } from "@/lib/tags/colors";
import CardDeckSelect from "./CardDeckSelect";

export default function CardList({
  rows,
  total,
  page,
  pageCount,
  listHref,
  filtered,
  tagLooks,
  decks,
}: {
  rows: CardRow[];
  total: number;
  page: number;
  pageCount: number;
  /** Die Adresse dieser Liste samt Filter, damit „Zurück" sie wiederfindet. */
  listHref: string;
  filtered: boolean;
  tagLooks: TagLook[];
  /** Die Decks der Sprache, mit Emoji, für die Auswahl in jeder Zeile. */
  decks: { value: string; label: string }[];
}) {
  const looks = new Map(tagLooks.map((tag) => [tag.name, tag]));
  return (
    <ComponentCard action={<PerPageSelect />}>
      {rows.length === 0 ? (
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          {filtered
            ? "Für diese Auswahl gibt es keine Karte."
            : "Noch keine Karte in dieser Sprache."}
        </p>
      ) : (
        <ul className="stagger -my-3 divide-y divide-gray-100 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] dark:divide-gray-800">
          {rows.map((card) => {
            const editHref = `/karten/${card.id}?zurueck=${encodeURIComponent(listHref)}`;
            return (
              <li
                key={card.id}
                // Ein Raster für alle Zeilen (Subgrid), sonst springt die Übersetzung je nach Zahl der Tags.
                className="grid grid-cols-1 gap-x-6 gap-y-2 py-3 md:grid-cols-2 lg:col-span-3 lg:grid-cols-subgrid lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Link
                    href={editHref}
                    lang="fr"
                    className="link-underline truncate text-base font-medium text-gray-800 dark:text-white/90"
                  >
                    {card.front}
                  </Link>
                  {card.gender && (
                    <Badge size="sm" color="light">
                      {GENDER_LABELS[card.gender]}
                    </Badge>
                  )}
                </div>
                <p className="text-theme-sm min-w-0 truncate text-gray-600 dark:text-gray-300">
                  {card.back}
                </p>
                <div className="flex flex-wrap items-center gap-2 md:col-span-2 lg:col-span-1 lg:justify-end">
                  {card.tags.map((tag) => (
                    <TagChip key={tag} tag={lookOf(tag, looks)} />
                  ))}
                  {card.reverse && (
                    <Badge size="sm" color="light">
                      umgekehrt
                    </Badge>
                  )}
                  <CardDeckSelect
                    cardId={card.id}
                    deckId={card.deckId}
                    decks={decks}
                    front={card.front}
                  />
                  <Link
                    href={editHref}
                    aria-label={`${card.front} bearbeiten`}
                    title="Bearbeiten"
                    className="flex size-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
                  >
                    <PencilIcon />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {total > 0 && (
        <ListFooter
          summary={listSummary(total, page, pageCount, {
            one: "Karte",
            many: "Karten",
          })}
          page={page}
          pageCount={pageCount}
        />
      )}
    </ComponentCard>
  );
}
