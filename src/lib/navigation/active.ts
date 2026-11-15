// Auch Unterseiten gehören zu ihrem Menüpunkt: /karten/neu zählt zu „Karten",
// nicht zur „Übersicht". Deshalb gewinnt der längste Präfix.
export function activeHref(
  pathname: string,
  hrefs: readonly string[],
): string | null {
  let best: string | null = null;
  for (const href of hrefs) {
    const matches =
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    if (matches && (!best || href.length > best.length)) best = href;
  }
  return best;
}
