"use client"; // Gesteuerte Auswahl.

import { TAG_COLOR_LABELS, TAG_COLORS, type TagColor } from "@/lib/tags/colors";
import TagChip from "./TagChip";

/** Die fünf Farben als Chips; der gewählte trägt einen Rahmen. */
export default function ColorChoice({
  value,
  onChange,
  name,
  emoji,
}: {
  value: TagColor;
  onChange: (color: TagColor) => void;
  name: string;
  emoji: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
        Farbe
      </legend>
      <div className="flex flex-wrap gap-2">
        {TAG_COLORS.map((color) => (
          <label
            key={color}
            title={TAG_COLOR_LABELS[color]}
            className={`flex min-h-11 cursor-pointer items-center rounded-full px-1 ring-offset-2 has-focus-visible:ring-2 ${
              value === color
                ? "ring-2 ring-gray-800 dark:ring-white/70 dark:ring-offset-gray-900"
                : ""
            }`}
          >
            <input
              type="radio"
              name="tag-color"
              value={color}
              checked={value === color}
              onChange={() => onChange(color)}
              className="sr-only"
            />
            <TagChip
              size="md"
              tag={{
                name: name || TAG_COLOR_LABELS[color],
                emoji: emoji || null,
                color,
              }}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
