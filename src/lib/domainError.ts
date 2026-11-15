/**
 * **Ein Fehler, den der Benutzer lesen darf.** Alles andere fliegt weiter und
 * landet auf der Fehlerseite — das ist der Unterschied, den `runAction()`
 * braucht: „Diese Adresse gibt es schon" gehört ins Formular, ein kaputter
 * Datenbankaufruf gehört nicht dorthin.
 *
 * Vorher hatte jeder Fachbereich seine eigene Klasse **und** seinen eigenen
 * Wächter, der sie abfing — acht fast gleiche Blöcke. Die Klassen bleiben, sie
 * erben jetzt nur von hier; ein `instanceof ClientError` sagt weiterhin
 * dasselbe.
 *
 * `field` sagt, an welchem Eingabefeld es liegt (§3). Ohne Angabe steht die
 * Meldung über dem Formular.
 */
export class DomainError extends Error {
  readonly field: string | undefined;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "DomainError";
    this.field = field;
  }
}
