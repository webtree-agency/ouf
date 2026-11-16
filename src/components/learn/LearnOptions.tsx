import Link from "next/link";

import { ChevronDownIcon } from "@/icons";
import { withFilter, type LearnFilter } from "@/lib/learning/filter";
import type { TagLook } from "@/lib/tags/colors";

type Choice = { label: string; href: string; active: boolean };

const CHIP =
  "text-theme-sm inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 font-medium transition";
const ON =
  "border-gray-900 bg-gray-900 text-white dark:border-brand-300 dark:bg-brand-300 dark:text-gray-900";
const OFF =
  "border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600";

export type DeckChoice = { id: string; label: string };

/**
 * **Wie gelernt wird, zum Antippen.** Jeder Chip ist ein Link mit der
 * geänderten Auswahl; nichts ist Pflicht, und ein zweites Antippen nimmt
 * eine Einschränkung wieder weg.
 */
export default function LearnOptions({
  filter,
  decks,
  tags,
  genders,
  languageName,
}: {
  filter: LearnFilter;
  decks: DeckChoice[];
  tags: TagLook[];
  genders: boolean;
  languageName: string;
}) {
  const to = (patch: Partial<LearnFilter>) => withFilter(filter, patch);
  // Wer den gewählten Chip noch einmal antippt, hebt die Einschränkung auf.
  const toggle = <K extends keyof LearnFilter>(key: K, value: LearnFilter[K]) =>
    to({ [key]: filter[key] === value ? undefined : value });

  const groups: { title: string; choices: Choice[] }[] = [
    {
      title: "Was",
      choices: [
        {
          label: "Was fällig ist",
          href: to({ all: false }),
          active: !filter.all,
        },
        { label: "Alles üben", href: to({ all: true }), active: filter.all },
      ],
    },
    {
      title: "Reihenfolge",
      choices: [
        {
          label: "Wie geplant",
          href: to({ random: false }),
          active: !filter.random,
        },
        {
          label: "Zufällig",
          href: to({ random: true }),
          active: filter.random,
        },
      ],
    },
    {
      title: "Richtung",
      choices: [
        {
          label: "Beide",
          href: to({ direction: undefined }),
          active: !filter.direction,
        },
        {
          label: `${languageName} → Deutsch`,
          href: toggle("direction", "vor"),
          active: filter.direction === "vor",
        },
        {
          label: `Deutsch → ${languageName}`,
          href: toggle("direction", "zurueck"),
          active: filter.direction === "zurueck",
        },
      ],
    },
    {
      title: "Stufe",
      choices: [
        {
          label: "Alle",
          href: to({ level: undefined }),
          active: !filter.level,
        },
        {
          label: "Neu",
          href: toggle("level", "neu"),
          active: filter.level === "neu",
        },
        {
          label: "Am Lernen",
          href: toggle("level", "lernen"),
          active: filter.level === "lernen",
        },
        {
          label: "Schwierig",
          href: toggle("level", "schwer"),
          active: filter.level === "schwer",
        },
        {
          label: "Sitzt",
          href: toggle("level", "sitzt"),
          active: filter.level === "sitzt",
        },
      ],
    },
  ];
  if (genders)
    groups.push({
      title: "Genus",
      choices: [
        {
          label: "Alle",
          href: to({ gender: undefined }),
          active: !filter.gender,
        },
        {
          label: "männlich",
          href: toggle("gender", "m"),
          active: filter.gender === "m",
        },
        {
          label: "weiblich",
          href: toggle("gender", "f"),
          active: filter.gender === "f",
        },
      ],
    });
  if (decks.length > 1)
    groups.push({
      title: "Deck",
      choices: [
        {
          label: "Alle Decks",
          href: to({ deckId: undefined }),
          active: !filter.deckId,
        },
        ...decks.map((deck) => ({
          label: deck.label,
          href: toggle("deckId", deck.id),
          active: filter.deckId === deck.id,
        })),
      ],
    });
  if (tags.length > 0)
    groups.push({
      title: "Tag",
      choices: [
        {
          label: "Alle Tags",
          href: to({ tag: undefined }),
          active: !filter.tag,
        },
        ...tags.map((tag) => ({
          label: tag.emoji ? `${tag.emoji} ${tag.name}` : tag.name,
          href: toggle("tag", tag.name),
          active: filter.tag === tag.name,
        })),
      ],
    });

  // Nur, was gewählt ist; die Vorgabe jeder Gruppe ist ihr erster Chip.
  const chosen = groups
    .flatMap((group) =>
      group.choices.slice(1).filter((choice) => choice.active),
    )
    .map((choice) => choice.label);
  const summary = chosen.length ? chosen : ["Was fällig ist, wie geplant"];

  return (
    <details className="group mb-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="eyebrow bg-brand-100 dark:bg-brand-300/15 shrink-0">
          Wie lernen
        </span>
        <span className="text-theme-sm min-w-0 flex-1 truncate text-gray-600 dark:text-gray-300">
          {summary.join(" · ")}
        </span>
        <ChevronDownIcon
          aria-hidden
          className="shrink-0 text-gray-500 transition group-open:rotate-180"
        />
      </summary>
      <div className="motion-safe:animate-reveal space-y-4 border-t border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-theme-xs mb-2 font-medium text-gray-500 dark:text-gray-400">
              {group.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.choices.map((choice) => (
                <Link
                  key={choice.label}
                  href={choice.href}
                  scroll={false}
                  replace
                  aria-current={choice.active ? "true" : undefined}
                  className={`${CHIP} ${choice.active ? ON : OFF}`}
                >
                  {choice.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
