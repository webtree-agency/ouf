/** Die fünf Farben eines Tags, je eine Farbe des Badges (keine neue im System). */
export const TAG_COLORS = ["blue", "green", "amber", "red", "gray"] as const;
export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_COLOR_LABELS: Record<TagColor, string> = {
  blue: "Blau",
  green: "Grün",
  amber: "Gelb",
  red: "Rot",
  gray: "Grau",
};

/** Ein Tag, wie es die Oberfläche zeigt. */
export type TagLook = { name: string; emoji: string | null; color: TagColor };
