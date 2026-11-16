import { DomainError } from "../domainError.ts";

/**
 * **Abschrift über Whisper bei Cloudflare Workers AI** (`ENTSCHEIDE.md`). Es
 * erkennt Französisch und Deutsch im selben Satz, das Diktat des iPhones nicht.
 */
const MODEL = "@cf/openai/whisper-large-v3-turbo";

type Env = Record<string, string | undefined>;

// Unter der Grenze von 1 MB für Server Actions; die Aufnahme endet nach 30 s ohnehin.
export const MAX_AUDIO_BYTES = 900_000;

export function dictationConfigured(env: Env = process.env): boolean {
  return Boolean(
    env.ANTHROPIC_API_KEY &&
    env.CLOUDFLARE_AI_TOKEN &&
    env.CLOUDFLARE_ACCOUNT_ID,
  );
}

export async function transcribe(
  audio: Blob,
  fetchImpl: typeof fetch = fetch,
  env: Env = process.env,
): Promise<string> {
  if (audio.size === 0) throw new DomainError("Es kam keine Aufnahme an.");
  if (audio.size > MAX_AUDIO_BYTES)
    throw new DomainError("Die Aufnahme ist zu lang.");

  const bytes = Buffer.from(await audio.arrayBuffer());
  const response = await fetchImpl(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_AI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio: bytes.toString("base64") }),
    },
  );
  if (!response.ok) throw new Error(`Whisper antwortet mit ${response.status}`);
  const body = (await response.json()) as { result?: { text?: string } };
  const text = body.result?.text?.trim() ?? "";
  if (!text) throw new DomainError("Es war nichts zu verstehen.");
  return text;
}
