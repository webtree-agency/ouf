import CompactUrlSelect from "@/components/common/CompactUrlSelect";
import {
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
  PER_PAGE_PARAM,
} from "@/lib/queries/paginate";

const CHOICES = PER_PAGE_OPTIONS.map((size) => ({
  value: String(size),
  label: String(size),
}));

/**
 * Wie viele Zeilen eine Liste zeigt — **bei der Liste, nicht bei den Filtern**.
 * Es ist keine Auswahl über den Bestand, sondern über die Ansicht; im Template
 * steht sie deshalb im Kopf der Tabelle.
 */
export default function PerPageSelect({
  defaultSize = DEFAULT_PER_PAGE,
  param = PER_PAGE_PARAM,
  pageParam = "seite",
}: {
  defaultSize?: number;
  /** Nur wo zwei Listen auf einer Seite stehen — sonst teilen sie sich `pro-seite`. */
  param?: string;
  /** Die Seitenzahl, die dabei hinfällig wird; muss zur Liste passen. */
  pageParam?: string;
}) {
  return (
    <CompactUrlSelect
      param={param}
      defaultValue={String(defaultSize)}
      choices={CHOICES}
      resets={[pageParam]}
      suffix="Einträge"
    />
  );
}
