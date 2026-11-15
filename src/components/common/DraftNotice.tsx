"use client"; // Der Knopf verwirft im Browser.

import AuthNotice from "@/components/common/AuthNotice";
import { formatDateTime } from "@/lib/format/dateTime";

/**
 * **Warum hier etwas steht, das niemand gerade getippt hat.** Ein Formular, das
 * sich von selbst füllt, ist ohne diesen Satz ein Rätsel — und ohne den Knopf
 * müsste man jedes Feld einzeln leeren, um von vorn zu beginnen.
 */
export default function DraftNotice({
  savedAt,
  onDiscard,
}: {
  savedAt: number;
  onDiscard: () => void;
}) {
  return (
    <AuthNotice tone="info">
      Nicht gespeicherter Stand von {formatDateTime(new Date(savedAt))}{" "}
      wiederhergestellt.{" "}
      <button type="button" onClick={onDiscard} className="link-brand">
        Verwerfen
      </button>
    </AuthNotice>
  );
}
