/**
 * **Rechtschreibung über LanguageTool** (`ENTSCHEIDE.md`): kostenlos, ohne
 * Schlüssel, und es kennt Akzente und Genus („le maison" → „la maison").
 * Claude wäre dafür teurer und nicht besser.
 */
const ENDPOINT = "https://api.languagetool.org/v2/check";

// Eine Karte beginnt klein und endet ohne Punkt; das ist kein Fehler.
const IGNORED = /^(UPPERCASE_SENTENCE_START|.*PUNCTUATION.*|WHITESPACE_RULE)$/;

export type Match = {
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: { id: string };
};

/** Die Fassung mit dem jeweils ersten Vorschlag, oder `null`, wenn nichts zu ändern ist. */
export function corrected(text: string, matches: Match[]): string | null {
  let result = text;
  const usable = matches
    .filter((match) => !IGNORED.test(match.rule.id) && match.replacements[0])
    .sort((a, b) => b.offset - a.offset);
  for (const match of usable) {
    result =
      result.slice(0, match.offset) +
      match.replacements[0].value +
      result.slice(match.offset + match.length);
  }
  return result === text ? null : result;
}

function languageToolCode(code: string): string {
  return ({ en: "en-GB", pt: "pt-PT" } as Record<string, string>)[code] ?? code;
}

export async function checkSpelling(
  text: string,
  languageCode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  // Fällt der Dienst aus, gibt es eben keinen Hinweis; das Erfassen geht weiter.
  try {
    const response = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text,
        language: languageToolCode(languageCode),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { matches?: Match[] };
    return corrected(text, body.matches ?? []);
  } catch {
    return null;
  }
}
