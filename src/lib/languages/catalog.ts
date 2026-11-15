/**
 * Die Sprachen, die man anlegen kann. **Vorbereitet ist nur Französisch**: Es
 * kennt Genus und Artikel. Die übrigen haben eine Sprechsprache und sonst
 * nichts; der Name steht hier und nicht in der Datenbank.
 */
export type LanguageProfile = {
  code: string;
  name: string;
  /** Für die Sprachausgabe des Browsers (BCP 47). */
  speech: string;
  /** Genus als eigenes Feld, lernbar und filterbar. */
  genders: boolean;
};

export const LANGUAGES: readonly LanguageProfile[] = [
  { code: "fr", name: "Französisch", speech: "fr-FR", genders: true },
  { code: "en", name: "Englisch", speech: "en-GB", genders: false },
  { code: "it", name: "Italienisch", speech: "it-IT", genders: false },
  { code: "es", name: "Spanisch", speech: "es-ES", genders: false },
  { code: "pt", name: "Portugiesisch", speech: "pt-PT", genders: false },
  { code: "nl", name: "Niederländisch", speech: "nl-NL", genders: false },
];

export const LANGUAGE_CODES = LANGUAGES.map((language) => language.code) as [
  string,
  ...string[],
];

export function languageProfile(code: string): LanguageProfile {
  return (
    LANGUAGES.find((language) => language.code === code) ?? {
      code,
      name: code,
      speech: code,
      genders: false,
    }
  );
}

export const GENDER_LABELS = { m: "männlich", f: "weiblich" } as const;
export type Gender = keyof typeof GENDER_LABELS;
