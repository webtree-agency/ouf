const DEFAULT_TARGET = "/";
const PRUEF_HERKUNFT = "https://ziel.invalid";

// `//fremde.ch` ist für den Browser eine vollständige Adresse, und Tab oder
// Zeilenumbruch streicht er vorher weg: `/\t/fremde.ch` wird zu `//fremde.ch`.
const STEUERZEICHEN = /[\u0000-\u001F\u007F]/;

export function safeRedirectTarget(value: string | undefined | null): string {
  if (!value) return DEFAULT_TARGET;
  if (STEUERZEICHEN.test(value)) return DEFAULT_TARGET;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_TARGET;
  if (value.includes("\\")) return DEFAULT_TARGET;
  if (!bleibtEigen(value)) return DEFAULT_TARGET;

  return value;
}

function bleibtEigen(value: string): boolean {
  try {
    return new URL(value, PRUEF_HERKUNFT).origin === PRUEF_HERKUNFT;
  } catch {
    return false;
  }
}
