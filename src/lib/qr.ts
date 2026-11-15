import qrcode from "qrcode-generator";

/**
 * QR-Code als Bild-Adresse, serverseitig erzeugt. So bleibt der Encoder aus dem
 * Browser-Bundle, und die Seite kommt ohne `dangerouslySetInnerHTML` aus.
 *
 * Das erzeugte SVG bringt eine weisse Fläche mit — ohne die wäre der Code im
 * dunklen Modus dunkel auf dunkel und liesse sich nicht scannen.
 */
export function qrDataUri(text: string): string {
  // 0 = Grösse nach Inhalt, "M" = mittlere Fehlerkorrektur. Beides der Normalfall
  // für otpauth-Adressen, die rund hundert Zeichen lang sind.
  const code = qrcode(0, "M");
  code.addData(text);
  code.make();

  const svg = code.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
