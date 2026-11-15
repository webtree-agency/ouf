import type { Gender } from "../languages/catalog.ts";

/**
 * Was der Artikel über das Genus sagt. „la maison" ist weiblich, „le chat"
 * männlich; bei „l'eau" und „les" sagt er nichts, dort wählt man selbst.
 */
export function genderFromArticle(front: string): Gender | null {
  const anfang = front.trim().toLowerCase();
  if (/^(la|une)\s/.test(anfang)) return "f";
  if (/^(le|un)\s/.test(anfang)) return "m";
  return null;
}
