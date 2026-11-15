export type Page = {
  /** Die gültige Seite — geklemmt, nicht die aus der Adresse. */
  page: number;
  pageCount: number;
  offset: number;
};

/**
 * Rechnet die Seite aus, die es wirklich gibt. Aus der Adresse kommt jede Zahl:
 * `seite=0`, `seite=99` oder Unsinn. Ohne Klemmen zeigte die Liste dann nichts
 * an, obwohl Treffer da sind — und niemand sähe, warum.
 */
export function paginate(
  total: number,
  perPage: number,
  wanted: number | undefined,
): Page {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(wanted ?? 1, 1), pageCount);

  return { page, pageCount, offset: (page - 1) * perPage };
}

/** Was jede Liste im Cockpit zur Auswahl stellt — eine Liste für alle. */
export const PER_PAGE_OPTIONS = [10, 30, 50, 100] as const;

/**
 * **Zehn, nicht dreissig** (Jann, 05.08.2026). Eine Liste, die man überblickt,
 * ohne zu scrollen, ist schneller zu lesen als eine, in der man sucht — und wer
 * mehr sehen will, stellt es oben um; die Wahl steht in der Adresse und bleibt.
 */
export const DEFAULT_PER_PAGE = 10;

/** In der Adresse steht `pro-seite`, für Listen wie für die Paginierung. */
export const PER_PAGE_PARAM = "pro-seite";

/**
 * Wie viele Einträge eine Liste zeigt. Die Auswahl steht in der Adresse und ist
 * damit von aussen frei wählbar — deshalb gilt nur, was hier steht. Sonst holte
 * `pro-seite=1000000` in einem Aufruf den ganzen Bestand.
 */
export function perPageFrom(
  value: string | undefined,
  fallback: number = DEFAULT_PER_PAGE,
): number {
  const wanted = Number(value);
  return PER_PAGE_OPTIONS.includes(wanted as (typeof PER_PAGE_OPTIONS)[number])
    ? wanted
    : fallback;
}
