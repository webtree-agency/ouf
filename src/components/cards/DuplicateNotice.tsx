import type { Duplicate } from "@/lib/queries/cards";

/** Die Vorderseite gibt es in der Sprache schon; speichern darf man trotzdem. */
export default function DuplicateNotice({
  duplicates,
}: {
  duplicates: Duplicate[];
}) {
  if (duplicates.length === 0) return null;
  return (
    <p
      role="status"
      className="text-theme-xs text-warning-700 dark:text-warning-400 mt-1.5"
    >
      Gibt es schon:{" "}
      {duplicates
        .map(
          (duplicate) =>
            `${duplicate.front} · ${duplicate.back} (${duplicate.deckName})`,
        )
        .join("; ")}
    </p>
  );
}
