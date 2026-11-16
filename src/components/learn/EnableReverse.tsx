"use client"; // Schaltet auf Klick ein.

import { useState, useTransition } from "react";

import { enableReverseAction } from "@/app/(app)/lernen/actions";
import Button from "@/components/ui/button/Button";
import { counted } from "@/lib/format/plural";
import type { LearnFilter } from "@/lib/learning/filter";

/** Bei Deutsch → Fremdsprache: Karten, die das noch nicht können, mit einem Klick dazunehmen. */
export default function EnableReverse({
  count,
  filter,
}: {
  count: number;
  filter: LearnFilter;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-theme-sm flex-1 text-gray-600 dark:text-gray-300">
        {error ??
          `${counted(count, { one: "Karte wird", many: "Karten werden" })} noch nicht umgekehrt abgefragt.`}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await enableReverseAction(filter);
            if (!result.ok) setError(result.message);
          })
        }
      >
        {pending ? "Wird eingeschaltet …" : "Für alle einschalten"}
      </Button>
    </div>
  );
}
