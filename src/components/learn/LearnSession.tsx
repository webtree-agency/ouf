"use client"; // Aufdecken, Bewerten, Tastatur und Vorlesen laufen im Browser.

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { rate, undo } from "@/app/(app)/lernen/actions";
import AuthNotice from "@/components/common/AuthNotice";
import { RegenerateIcon } from "@/icons";
import type { LearnFilter } from "@/lib/learning/filter";
import type { Rating } from "@/lib/learning/scheduler";
import type { StudyState } from "@/lib/learning/session";
import LearnDone from "./LearnDone";
import RatingBar from "./RatingBar";
import StudyCardView from "./StudyCardView";
import { useSpeech } from "./useSpeech";

const MOTION = {
  in: "motion-safe:animate-card-in",
  left: "motion-safe:animate-card-out-left",
  right: "motion-safe:animate-card-out-right",
};

export default function LearnSession({
  initial,
  filter,
}: {
  initial: StudyState;
  /** Wie gelernt wird; geht mit jeder Bewertung mit, für die nächste Karte. */
  filter: LearnFilter;
}) {
  const [state, setState] = useState(initial);
  const [revealed, setRevealed] = useState(false);
  const [flips, setFlips] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Die Karte gleitet hinaus, während der Server antwortet: „Nochmal" nach links.
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const [pending, startTransition] = useTransition();
  const shownAt = useRef(0);
  const { available, speak } = useSpeech(state.speech);
  const card = state.card;

  useEffect(() => {
    shownAt.current = Date.now();
  }, [card?.scheduleId, card?.reps]);

  const show = useCallback((next: StudyState) => {
    setState(next);
    setRevealed(false);
    setFlips(0);
    setError(null);
    setLeaving(null);
  }, []);

  const doRate = useCallback(
    (rating: Rating) => {
      if (!card || !revealed || pending) return;
      setLeaving(rating === 1 ? "left" : "right");
      startTransition(async () => {
        const result = await rate({
          scheduleId: card.scheduleId,
          rating,
          reps: card.reps,
          durationMs: Date.now() - shownAt.current,
          filter,
        });
        if (result.ok) show(result.data);
        else {
          setLeaving(null);
          setError(result.message);
        }
      });
    },
    [card, revealed, pending, filter, show],
  );

  const doUndo = useCallback(() => {
    if (!state.canUndo || pending) return;
    startTransition(async () => {
      const result = await undo(filter);
      if (result.ok) show(result.data);
      else setError(result.message);
    });
  }, [state.canUndo, pending, filter, show]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        (event.target as HTMLElement).closest(
          "input, textarea, select, [contenteditable]",
        )
      )
        return;
      if ((event.key === " " || event.key === "Enter") && card && !revealed) {
        event.preventDefault();
        setRevealed(true);
      } else if (/^[1-4]$/.test(event.key) && revealed) {
        doRate(Number(event.key) as Rating);
      } else if (event.key.toLowerCase() === "z") {
        doUndo();
      } else if (event.key.toLowerCase() === "v" && card && available) {
        if (card.direction === "forward" || revealed) speak(card.front);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, doRate, doUndo, speak, available]);

  const { neu, lernen, faellig } = state.counts;

  return (
    <div
      data-learning={card ? "" : undefined}
      className="flex flex-1 flex-col items-center pb-36 md:pb-0"
    >
      <div className="flex w-full items-center justify-between gap-3 lg:w-2/3">
        <p
          className="text-theme-sm text-gray-500 dark:text-gray-400"
          aria-live="polite"
        >
          <span
            className={
              card?.isNew ? "dark:text-brand-300 font-medium text-gray-900" : ""
            }
          >
            {neu} neu
          </span>{" "}
          · {lernen} im Lernschritt · {faellig} fällig
        </p>
        <button
          type="button"
          onClick={doUndo}
          disabled={!state.canUndo || pending}
          aria-keyshortcuts="z"
          title="Letzte Bewertung zurücknehmen (Z)"
          className="text-theme-sm flex h-11 items-center gap-2 rounded-lg px-3 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:invisible dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
        >
          <RegenerateIcon />
          <span className="hidden sm:inline">Rückgängig</span>
        </button>
      </div>

      {error && (
        <AuthNotice tone="error" className="mt-4 w-full lg:w-2/3">
          {error}
        </AuthNotice>
      )}

      {card ? (
        <>
          <div
            key={`${card.scheduleId}-${card.reps}`}
            className={`mt-4 w-full lg:w-2/3 ${MOTION[leaving ?? "in"]}`}
          >
            <StudyCardView
              card={card}
              revealed={revealed}
              flips={flips}
              onFlip={() => {
                if (pending) return;
                setRevealed((value) => !value);
                setFlips((value) => value + 1);
              }}
              onSpeak={available ? speak : undefined}
            />
            <p className="text-theme-xs mt-2 text-center text-gray-500 dark:text-gray-400">
              {card.deckName}
            </p>
          </div>
          <div className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/90 px-4 pt-4 backdrop-blur-md md:static md:mt-6 md:w-full md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none lg:w-2/3 dark:border-gray-800 dark:bg-gray-900/90 md:dark:bg-transparent">
            {revealed ? (
              <RatingBar
                intervals={card.intervals}
                onRate={doRate}
                disabled={pending}
              />
            ) : (
              <>
                {/* Am Handy dreht ein Tipp auf die Karte sie um; der Knopf bleibt für Vorlesehilfen. */}
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  aria-keyshortcuts="Space"
                  className="dark:bg-brand-300 dark:hover:bg-brand-200 flex h-14 w-full items-center justify-center rounded-xl bg-gray-800 text-base font-medium text-white transition hover:bg-gray-900 active:scale-97 max-md:sr-only dark:text-gray-900"
                >
                  Aufdecken
                </button>
                <p className="text-theme-sm pb-2 text-center text-gray-500 md:hidden dark:text-gray-400">
                  Karte antippen, dann bewerten.
                </p>
              </>
            )}
            <p className="text-theme-xs mt-3 hidden text-center text-gray-500 md:block dark:text-gray-400">
              {revealed
                ? "1 bis 4 bewertet · Z nimmt zurück"
                : "Leertaste deckt auf"}
            </p>
          </div>
        </>
      ) : (
        <LearnDone hasWaiting={lernen > 0} filter={filter} />
      )}
    </div>
  );
}
