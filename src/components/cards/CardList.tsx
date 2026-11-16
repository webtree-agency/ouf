import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import ListFooter from "@/components/common/ListFooter";
import PerPageSelect from "@/components/common/PerPageSelect";
import TagChip, { lookOf } from "@/components/tags/TagChip";
import Badge from "@/components/ui/badge/Badge";
import { listSummary } from "@/lib/format/listSummary";
import type { CardRow } from "@/lib/queries/cards";
import type { TagLook } from "@/lib/tags/colors";

export default function CardList({
  rows,
  total,
  page,
  pageCount,
  listHref,
  filtered,
  tagLooks,
}: {
  rows: CardRow[];
  total: number;
  page: number;
  pageCount: number;
  /** Die Adresse dieser Liste samt Filter, damit „Zurück" sie wiederfindet. */
  listHref: string;
  filtered: boolean;
  tagLooks: TagLook[];
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
        <ul className="stagger -my-3 divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((card) => (
            <li
              key={card.id}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/karten/${card.id}?zurueck=${encodeURIComponent(listHref)}`}
                    className="link-underline truncate text-base font-medium text-gray-800 dark:text-white/90"
                  >
                    {card.front}
                  </Link>
                  {card.gender && (
                    <span
                      className="text-theme-xs text-gray-500 dark:text-gray-400"
                      title={card.gender === "f" ? "weiblich" : "männlich"}
                    >
                      {card.gender}
                    </span>
                  )}
                </div>
                <p className="text-theme-sm truncate text-gray-500 dark:text-gray-400">
                  {card.back}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                  {card.deckName}
                </span>
                {card.reverse && (
                  <Badge size="sm" color="light">
                    umgekehrt
                  </Badge>
                )}
                {card.tags.map((tag) => (
                  <TagChip key={tag} tag={lookOf(tag, looks)} />
                ))}
              </div>
            </li>
          ))}
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
