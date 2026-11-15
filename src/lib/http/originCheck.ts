/**
 * **Schreibende Anfragen nur von der eigenen Herkunft.** Next prüft das bei
 * Server Actions selbst, bei Routen nicht; deshalb prüft der Proxy beides.
 *
 * Geglaubt wird zuerst `Sec-Fetch-Site`, die setzt nur der Browser. Fehlt sie,
 * muss der `Origin` zum Namen der Anfrage passen. Fehlen beide, ist es kein
 * Browser, und ohne Browser gibt es keinen fremden Cookie.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function crossOriginRejected(input: {
  method: string;
  host: string | null;
  origin: string | null;
  secFetchSite: string | null;
}): boolean {
  if (SAFE_METHODS.has(input.method.toUpperCase())) return false;
  if (input.secFetchSite) return input.secFetchSite !== "same-origin";
  if (!input.origin) return false;

  return originHost(input.origin) !== input.host?.toLowerCase();
}

function originHost(origin: string): string | null {
  try {
    return new URL(origin).host.toLowerCase();
  } catch {
    return null;
  }
}
