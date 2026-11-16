import { z } from "zod";

/**
 * **Wie gelernt wird**, aus der Adresse. Alles ist wählbar, nichts Pflicht:
 * ohne Angabe gilt, was fällig ist, in der geplanten Reihenfolge, über alle
 * Decks und beide Richtungen.
 */
export const LEVELS = ["neu", "lernen", "schwer", "sitzt"] as const;
export type Level = (typeof LEVELS)[number];

export const learnFilter = z.object({
  deckId: z.uuid().optional(),
  tag: z.string().min(1).max(40).optional(),
  gender: z.enum(["m", "f"]).optional(),
  level: z.enum(LEVELS).optional(),
  /** `vor`: Fremdsprache → Deutsch, `zurueck`: Deutsch → Fremdsprache. */
  direction: z.enum(["vor", "zurueck"]).optional(),
  random: z.boolean().default(false),
  /** Alles üben statt nur das Fällige; das Tageslimit für Neue gilt dann nicht. */
  all: z.boolean().default(false),
});
export type LearnFilter = z.infer<typeof learnFilter>;

/** Die Namen in der Adresse, deutsch wie überall. */
export const FILTER_PARAMS = {
  deckId: "deck",
  tag: "tag",
  gender: "genus",
  level: "stufe",
  direction: "richtung",
  random: "reihenfolge",
  all: "umfang",
} as const;

type Params = Record<string, string | string[] | undefined>;

/** Was nicht passt, fällt still weg; die Seite zeigt dann eben mehr. */
export function filterFromParams(params: Params): LearnFilter {
  const one = (key: string) => {
    const value = params[key];
    return typeof value === "string" && value ? value : undefined;
  };
  const pick = <T>(schema: z.ZodType<T>, value: unknown) => {
    const parsed = schema.safeParse(value);
    return parsed.success ? parsed.data : undefined;
  };
  return {
    deckId: pick(z.uuid(), one(FILTER_PARAMS.deckId)),
    tag: pick(z.string().max(40), one(FILTER_PARAMS.tag)),
    gender: pick(z.enum(["m", "f"]), one(FILTER_PARAMS.gender)),
    level: pick(z.enum(LEVELS), one(FILTER_PARAMS.level)),
    direction: pick(z.enum(["vor", "zurueck"]), one(FILTER_PARAMS.direction)),
    random: one(FILTER_PARAMS.random) === "zufall",
    all: one(FILTER_PARAMS.all) === "alle",
  };
}

export function filterToQuery(filter: LearnFilter): string {
  const search = new URLSearchParams();
  if (filter.deckId) search.set(FILTER_PARAMS.deckId, filter.deckId);
  if (filter.tag) search.set(FILTER_PARAMS.tag, filter.tag);
  if (filter.gender) search.set(FILTER_PARAMS.gender, filter.gender);
  if (filter.level) search.set(FILTER_PARAMS.level, filter.level);
  if (filter.direction) search.set(FILTER_PARAMS.direction, filter.direction);
  if (filter.random) search.set(FILTER_PARAMS.random, "zufall");
  if (filter.all) search.set(FILTER_PARAMS.all, "alle");
  return search.size ? `?${search}` : "";
}

/** Dieselbe Auswahl mit einem geänderten Teil, für die Chips. */
export function withFilter(
  filter: LearnFilter,
  patch: Partial<LearnFilter>,
): string {
  return `/lernen${filterToQuery({ ...filter, ...patch })}`;
}

/** Ein Schlüssel, der wechselt, sobald sich die Auswahl ändert. */
export function filterKey(filter: LearnFilter): string {
  return filterToQuery(filter) || "alles";
}
