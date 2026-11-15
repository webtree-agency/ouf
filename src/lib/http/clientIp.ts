/**
 * Die Adresse der Gegenstelle. Hinter einem Proxy steht sie in
 * `x-forwarded-for`, den der Proxy selbst setzt. Sie wird nie gespeichert,
 * nur gehasht und gezählt (`auth/rateLimit.ts`).
 */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}
