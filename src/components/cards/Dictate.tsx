"use client"; // Mikrofon.

import Button from "@/components/ui/button/Button";
import { useRecorder } from "@/hooks/useRecorder";
import { MicrophoneIcon, SparkIcon } from "@/icons";

/**
 * **Wort sagen, Übersetzung dazu, fertig.** Daneben „Vorschlagen" für
 * Getipptes; ein zweiter Klick schlägt etwas anderes vor.
 */
export default function Dictate({
  language,
  busy,
  suggested,
  error,
  onAudio,
  onSuggest,
  onError,
}: {
  /** Der Name der Sprache, für den Hinweis daneben. */
  language: string;
  busy: boolean;
  suggested: boolean;
  error: string | null;
  onAudio: (audio: Blob) => void;
  onSuggest: () => void;
  onError: (message: string | null) => void;
}) {
  const recorder = useRecorder(onAudio);

  async function toggle() {
    if (recorder.recording) return recorder.stop();
    onError(null);
    try {
      await recorder.start();
    } catch {
      onError("Das Mikrofon ist nicht freigegeben.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={toggle}
          disabled={busy}
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
          {recorder.recording ? "Fertig" : "Diktieren"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSuggest}
          disabled={busy || recorder.recording}
          startIcon={<SparkIcon />}
        >
          {suggested ? "Neu vorschlagen" : "Vorschlagen"}
        </Button>
      </div>
      <p
        role="status"
        className={`text-theme-xs min-h-4.5 ${error ? "text-error-600 dark:text-error-400" : "text-gray-500 dark:text-gray-400"}`}
      >
        {error ??
          (recorder.recording
            ? `Wort sagen, ${language} oder Deutsch, gern mit Übersetzung.`
            : "")}
      </p>
    </div>
  );
}
