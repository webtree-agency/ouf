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

const MAX_OPTIONS = 3;

// Abkürzungen wie „CAF" sind für eine Karte keine Korrektur.
const SHOUTING = /\p{Lu}{2,}/u;

/** „Très" am Satzanfang bleibt „très", wenn man klein angefangen hat. */
function keepCase(original: string, replacement: string): string {
  const first = original.charAt(0);
  return first && first === first.toLowerCase()
    ? replacement.charAt(0).toLowerCase() + replacement.slice(1)
    : replacement;
}

function apply(text: string, matches: Match[], pick: (m: Match) => string) {
  let result = text;
  for (const match of [...matches].sort((a, b) => b.offset - a.offset)) {
    const original = text.slice(match.offset, match.offset + match.length);
    result =
      result.slice(0, match.offset) +
      keepCase(original, pick(match)) +
      result.slice(match.offset + match.length);
  }
  return result;
}

/**
 * Bis zu drei Fassungen zum Antippen: Für den ersten Fehler je ein Vorschlag
 * von LanguageTool, die übrigen Fehler jeweils mit ihrem ersten. Leer heisst,
 * es ist nichts zu ändern.
 */
export function corrections(text: string, matches: Match[]): string[] {
  const usable = matches
    .filter((match) => !IGNORED.test(match.rule.id) && match.replacements[0])
    .sort((a, b) => a.offset - b.offset);
  if (usable.length === 0) return [];
  const [first] = usable;
  const options = first.replacements
    .slice(0, MAX_OPTIONS * 2)
    .map((replacement) =>
      apply(text, usable, (match) =>
        match === first ? replacement.value : match.replacements[0].value,
      ),
    );
  return [...new Set(options)]
    .filter((option) => option !== text && !SHOUTING.test(option))
    .slice(0, MAX_OPTIONS);
}

function languageToolCode(code: string): string {
  return ({ en: "en-GB", pt: "pt-PT" } as Record<string, string>)[code] ?? code;
}

export async function checkSpelling(
  text: string,
  languageCode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string[]> {
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
    if (!response.ok) return [];
    const body = (await response.json()) as { matches?: Match[] };
    return corrections(text, body.matches ?? []);
  } catch {
    return [];
  }
}
