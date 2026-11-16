/**
 * Die Adresse der Gegenstelle. ouf. läuft hinter Cloudflare, das sie in
 * `cf-connecting-ip` setzt; den ersten Eintrag in `x-forwarded-for` kann der
 * Browser selbst mitschicken. Sie wird nie gespeichert, nur gehasht und
 * gezählt (`auth/rateLimit.ts`).
 */
export function clientIp(headers: Headers): string | null {
  const cloudflare = headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}
