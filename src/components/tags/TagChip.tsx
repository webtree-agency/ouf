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

// Der Punkt trägt die Farbe, wo kein Emoji steht; wörtlich, damit Tailwind sie sieht.
const DOT: Record<TagColor, string> = {
  blue: "bg-brand-300",
  green: "bg-success-500",
  amber: "bg-warning-500",
  red: "bg-error-500",
  gray: "bg-gray-400",
};

/**
 * **Leise Fassung für Listen**: umrandet statt gefüllt, damit viele Tags in
 * einer Zeile nicht bunter sind als das Wort selbst.
 */
export function QuietTag({ tag }: { tag: TagLook }) {
  return (
    <span className="text-theme-xs inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2 py-0.5 font-medium whitespace-nowrap text-gray-700 dark:border-gray-700 dark:text-gray-300">
      {tag.emoji ? (
        <span aria-hidden className="leading-none">
          {tag.emoji}
        </span>
      ) : (
        <span
          aria-hidden
          className={`size-1.5 rounded-full ${DOT[tag.color]}`}
        />
      )}
      {tag.name}
    </span>
  );
}

/** Für Listen: der Name allein reicht, das Aussehen kommt aus `looks`. */
export function lookOf(
  name: string,
  looks: ReadonlyMap<string, TagLook>,
): TagLook {
  return looks.get(name) ?? { name, emoji: null, color: "gray" };
}
