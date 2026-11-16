"use client"; // Aufnahme und Vorschlag.

import { useState } from "react";

import { suggestCardAction } from "@/app/(app)/karten/actions";
import Button from "@/components/ui/button/Button";
import { useRecorder } from "@/hooks/useRecorder";
import { MicrophoneIcon } from "@/icons";
import type { Suggestion } from "@/lib/capture/suggest";

/**
 * **Wort sagen, Übersetzung dazu, fertig.** Whisper schreibt ab, Claude füllt
 * die Felder vor; gespeichert wird erst mit Enter.
 */
export default function Dictate({
  language,
  onSuggestion,
}: {
  /** Der Name der Sprache, für den Hinweis daneben. */
  language: string;
  onSuggestion: (suggestion: Suggestion) => void;
}) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRecorder(async (audio) => {
    setWorking(true);
    const form = new FormData();
    form.append("audio", audio);
    const result = await suggestCardAction(form);
    setWorking(false);
    if (result.ok) onSuggestion(result.data);
    else setError(result.message);
  });

  async function toggle() {
    if (recorder.recording) return recorder.stop();
    setError(null);
    try {
      await recorder.start();
    } catch {
      setError("Das Mikrofon ist nicht freigegeben.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={toggle}
        disabled={working}
        startIcon={
          recorder.recording ? (
            <span
              aria-hidden
              className="bg-error-500 h-2.5 w-2.5 rounded-full motion-safe:animate-pulse"
            />
          ) : (
            <MicrophoneIcon />
          )
        }
      >
        {working
          ? "Wird verstanden …"
          : recorder.recording
            ? "Fertig"
            : "Diktieren"}
      </Button>
      <span
        role="status"
        className={`text-theme-xs ${error ? "text-error-600 dark:text-error-400" : "text-gray-500 dark:text-gray-400"}`}
      >
        {error ??
          (recorder.recording
            ? "Wort sagen, gern mit Übersetzung."
            : `${language}, Deutsch oder beides.`)}
      </span>
    </div>
  );
}
