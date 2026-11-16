"use client"; // Aufklappen und Auswahl.

import { useState } from "react";

import { PlusIcon } from "@/icons";
import { isSingleEmoji } from "@/lib/validation/fields";
import { useEmojiSearch } from "./useEmojiSearch";

/** Eine Auswahl fürs Sprachenlernen; jedes andere über die Suche oder die Tastatur. */
// prettier-ignore
const SUGGESTIONS = [
  "📚", "🗣️", "💬", "✏️", "🎓", "🧠", "⭐", "🔥",
  "✈️", "🧳", "🏠", "🚗", "🚲", "🚆", "🌍", "🏔️",
  "🍷", "🥐", "🧀", "🍽️", "☕", "🛒", "💶", "💼",
  "🌳", "🌦️", "🐶", "👕", "❤️", "🎵", "🎬", "⚽",
  "🏥", "🕐", "📅", "👋", "🇫🇷", "🇨🇭", "🇮🇹", "🇪🇸",
];

/**
 * **Ein Emoji als Icon**, links neben dem Feld, das es schmückt (`children`).
 * Die Auswahl klappt unter der Zeile auf, nicht als schwebendes Menü: In
 * einem Dialog schliesst Escape sonst beides zugleich.
 */
export default function EmojiPicker({
  value,
  onChange,
  name,
  children,
}: {
  value: string;
  onChange: (emoji: string) => void;
  /** Der Name daneben; zu ihm stehen passende Emojis zuoberst. */
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState("");
  const found = useEmojiSearch(isSingleEmoji(own) ? "" : own, name, open);
  const searching = own.trim() !== "";
  const shown = searching
    ? found
    : [...new Set([...found, ...SUGGESTIONS])].slice(0, SUGGESTIONS.length);

  function pick(emoji: string) {
    onChange(emoji);
    setOpen(false);
    setOwn("");
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={value ? `Emoji ${value} ändern` : "Emoji wählen"}
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg border text-2xl transition ${
            open
              ? "border-gray-800 dark:border-white/60"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
          } ${value ? "" : "border-dashed text-gray-400"}`}
        >
          {value || <PlusIcon />}
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {open && (
        <div className="motion-safe:animate-pop mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
          <input
            value={own}
            autoFocus
            onChange={(event) => {
              const next = event.target.value;
              setOwn(next);
              if (isSingleEmoji(next.trim())) pick(next.trim());
            }}
            aria-label="Emoji suchen"
            placeholder="Suchen, zum Beispiel Auto"
            className="text-theme-sm mb-3 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:placeholder:text-white/30"
          />
          {searching && shown.length === 0 && (
            <p className="text-theme-xs py-2 text-gray-500 dark:text-gray-400">
              Nichts gefunden. Jedes Emoji geht auch über die Tastatur.
            </p>
          )}
          <div className="grid grid-cols-8 gap-1">
            {shown.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => pick(emoji)}
                aria-label={emoji}
                className={`flex aspect-square items-center justify-center rounded-lg text-xl hover:bg-gray-100 dark:hover:bg-white/5 ${
                  emoji === value ? "bg-brand-100 dark:bg-brand-300/15" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {value && (
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => pick("")}
                className="text-theme-sm link-underline text-gray-600 dark:text-gray-300"
              >
                Kein Emoji
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
