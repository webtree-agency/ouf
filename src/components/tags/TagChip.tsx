import Badge, { type BadgeColor } from "@/components/ui/badge/Badge";
import type { TagColor, TagLook } from "@/lib/tags/colors";

const BADGE: Record<TagColor, BadgeColor> = {
  blue: "primary",
  green: "success",
  amber: "warning",
  red: "error",
  gray: "light",
};

/** Ein Tag als Chip: Emoji, Name, Farbe. Unbekannte Namen kommen in Grau. */
export default function TagChip({
  tag,
  size = "sm",
  children,
}: {
  tag: TagLook;
  size?: "sm" | "md";
  /** Etwas hinter dem Namen, etwa der Knopf zum Entfernen. */
  children?: React.ReactNode;
}) {
  return (
    <Badge size={size} color={BADGE[tag.color]}>
      {tag.emoji && (
        <span aria-hidden className="leading-none">
          {tag.emoji}
        </span>
      )}
      {tag.name}
      {children}
    </Badge>
  );
}

/** Für Listen: der Name allein reicht, das Aussehen kommt aus `looks`. */
export function lookOf(
  name: string,
  looks: ReadonlyMap<string, TagLook>,
): TagLook {
  return looks.get(name) ?? { name, emoji: null, color: "gray" };
}
