import { createHash } from "node:crypto";

/**
 * Die Adresse wird nie gespeichert, nur gesalzen gehasht. **Ohne Salz zählt
 * ein gemeinsamer Topf, nicht keiner**: Im Cockpit fiel die Grenze bis zum
 * 31.10.2026 still weg, als das Salz fehlte.
 */
export function ipBucket(ip: string | null | undefined): string {
  const salt = process.env.IP_HASH_SALT;
  if (!ip || !salt) return "unbekannt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
