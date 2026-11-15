"use client"; // Fehlergrenzen sind Client-Komponenten.

import Button from "@/components/ui/button/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
        Das hat nicht geklappt
      </h1>
      <p className="text-base text-gray-500 dark:text-gray-400">
        {error.digest
          ? `Kennung ${error.digest}.`
          : "Bitte die Seite neu laden."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Noch einmal
        </Button>
        <Button href="/" variant="outline">
          Zur Übersicht
        </Button>
      </div>
    </div>
  );
}
