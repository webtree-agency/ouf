/**
 * Die Vorderseite in der Form, in der Dubletten auffallen: klein, ohne
 * doppelten Leerraum, gerade Apostrophe. **Akzente bleiben**: „pêche" und
 * „péché" sind zwei Wörter.
 */
export function frontKey(front: string): string {
  return front
    .normalize("NFC")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
