/**
 * Nur Namen, keine Bilder: Welches SVG dahintersteht, entscheidet die
 * Oberfläche (`components/shell/navIcons.tsx`).
 */
export type NavIcon =
  | "uebersicht"
  | "lernen"
  | "karten"
  | "decks"
  | "statistik"
  | "daten"
  | "sprachen"
  | "konto";

export type NavEntry = { label: string; href: string; icon: NavIcon };

export const MAIN_NAV: readonly NavEntry[] = [
  { label: "Übersicht", href: "/", icon: "uebersicht" },
  { label: "Lernen", href: "/lernen", icon: "lernen" },
  { label: "Karten", href: "/karten", icon: "karten" },
  { label: "Decks", href: "/decks", icon: "decks" },
  { label: "Statistik", href: "/statistik", icon: "statistik" },
];

/** Was man selten öffnet, steht im Benutzermenü. */
export const PERSONAL_LINKS: readonly NavEntry[] = [
  { label: "Konto", href: "/konto", icon: "konto" },
  { label: "Sprachen", href: "/sprachen", icon: "sprachen" },
  { label: "Import und Export", href: "/daten", icon: "daten" },
];
