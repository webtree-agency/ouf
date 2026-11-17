import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import ListFooter from "@/components/common/ListFooter";
import PerPageSelect from "@/components/common/PerPageSelect";
import { lookOf, QuietTag } from "@/components/tags/TagChip";
import Badge from "@/components/ui/badge/Badge";
import { deckLabel } from "@/lib/decks/label";
import { GENDER_LABELS } from "@/lib/languages/catalog";
import { listSummary } from "@/lib/format/listSummary";
import type { CardRow } from "@/lib/queries/cards";
import type { TagLook } from "@/lib/tags/colors";
import CardActions from "./CardActions";

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
        <ul className="stagger -my-3 divide-y divide-gray-100 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] dark:divide-gray-800">
          {rows.map((card) => {
            const editHref = `/karten/${card.id}?zurueck=${encodeURIComponent(listHref)}`;
            return (
              <li
                key={card.id}
                // Ein Raster für alle Zeilen (Subgrid), sonst springt die Übersetzung je nach Zahl der Tags.
                className="relative grid grid-cols-1 gap-x-6 gap-y-1.5 py-3 pr-12 md:grid-cols-2 lg:col-span-4 lg:grid-cols-subgrid lg:items-center lg:pr-0"
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
                <div className="flex flex-wrap items-center gap-1.5 md:col-span-2 lg:col-span-1 lg:justify-end">
                  {card.tags.map((tag) => (
                    <QuietTag key={tag} tag={lookOf(tag, looks)} />
                  ))}
                  {card.reverse && (
                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                      umgekehrt
                    </span>
                  )}
                  <span className="text-theme-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {deckLabel({ name: card.deckName, emoji: card.deckEmoji })}
                  </span>
                </div>
                {/* Am Handy oben rechts in der Ecke, ab dem Laptop am Ende der Zeile. */}
                <div className="absolute top-1.5 right-0 lg:static">
                  <CardActions
                    cardId={card.id}
                    front={card.front}
                    deckId={card.deckId}
                    decks={decks}
                    editHref={editHref}
                    listHref={listHref}
                  />
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
