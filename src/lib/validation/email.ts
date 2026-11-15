/**
 * **Eine Mailadresse wird an der Systemgrenze in die Form gebracht, in der sie
 * verschickt werden kann** — klein geschrieben, und die Domain in Punycode.
 *
 * Der Grund ist gemessen: `info@müller-partner.ch` wurde am 08.09.2026 vom
 * Newsletter mit „Invalid email address" abgewiesen. Resend nimmt eine
 * Umlaut-Domain nur als `xn--mller-partner-wob.ch`, und im Bestand standen 30
 * solcher Adressen — jede davon unerreichbar, ohne dass es je eine Meldung gab.
 *
 * Umgeschrieben wird **hier und nicht beim Versand**: Stünde die Adresse im
 * Bestand weiter mit Umlaut, könnte auch die Postfachprüfung nichts mit ihr
 * anfangen, und dieselbe Firma hätte je nach Weg zwei Adressen.
 *
 * **Angefasst wird allein die Domain.** Der lokale Teil gehört dem Postfach und
 * ist laut RFC 5321 unterscheidungsempfindlich; ihn kleinzuschreiben wäre eine
 * zweite Änderung, die niemand bestellt hat und die eine Anmeldung ins Leere
 * laufen lassen kann.
 */
export function normalizeEmail(value: string): string {
  const trimmed = value.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return trimmed;

  return `${trimmed.slice(0, at)}@${punycodeDomain(trimmed.slice(at + 1))}`;
}

/**
 * `new URL()` schreibt den Hostnamen selbst um — dafür braucht es kein
 * zusätzliches Paket. Was sich nicht als Adresse lesen lässt, bleibt, wie es
 * war; die Prüfung darüber weist es ohnehin ab.
 */
function punycodeDomain(domain: string): string {
  try {
    return new URL(`https://${domain}`).hostname;
  } catch {
    return domain.toLowerCase();
  }
}
