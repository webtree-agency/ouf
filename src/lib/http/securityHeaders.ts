/**
 * Die Kopfzeilen aus §8, auf jeder Antwort: auch auf Icons und Downloads, wo
 * das Meta-Tag im Layout nicht hinkommt.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  // Mikrofon und Kamera braucht ouf. nie; die Sprachausgabe ist keine Berechtigung.
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
