/**
 * **DeepL als Übersetzer, wenn ein Schlüssel da ist** (`DEEPL_API_KEY`). Der
 * Gratis-Plan (Schlüssel endet auf `:fx`) übersetzt 500'000 Zeichen im Monat
 * ohne Kosten; ohne Schlüssel übersetzt Claude.
 */
type Env = Record<string, string | undefined>;

export function deeplConfigured(env: Env = process.env): boolean {
  return Boolean(env.DEEPL_API_KEY);
}

function endpoint(key: string): string {
  return key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

/** Ein Ausdruck in der Fremdsprache auf Deutsch, oder `null`, wenn DeepL nichts liefert. */
export async function translateWithDeepl(
  text: string,
  languageCode: string,
  fetchImpl: typeof fetch = fetch,
  env: Env = process.env,
): Promise<string | null> {
  const key = env.DEEPL_API_KEY;
  if (!key) return null;
  const response = await fetchImpl(endpoint(key), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: languageCode.toUpperCase(),
      target_lang: "DE",
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`DeepL antwortet mit ${response.status}`);
  const body = (await response.json()) as {
    translations?: { text?: string }[];
  };
  const translated = body.translations?.[0]?.text?.trim().replace(/\.$/, "");
  return translated || null;
}
