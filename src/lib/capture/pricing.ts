/**
 * **Listenpreise in Dollar, Stand 16.11.2026.** Claude Haiku 5.5 je Million
 * Tokens, Whisper bei Cloudflare je Minute; Cloudflare schenkt täglich gut
 * 200 Minuten, die Zahl ist also eine obere Grenze.
 */
export const PRICES = {
  inputPerMillion: 0.1,
  outputPerMillion: 0.5,
  audioPerMinute: 0.0005,
} as const;

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  audioMs: number;
};

export function costOf(usage: Usage): number {
  return (
    (usage.inputTokens * PRICES.inputPerMillion +
      usage.outputTokens * PRICES.outputPerMillion) /
      1_000_000 +
    (usage.audioMs / 60_000) * PRICES.audioPerMinute
  );
}
