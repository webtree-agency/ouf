import { z } from "zod";

import { normalizeEmail } from "./email.ts";

/**
 * Die Bausteine für jedes Eingabefeld. Ein Fachbereich sagt, welche Art ein
 * Feld hat; er schreibt keine eigene Prüfung und keine eigene Meldung.
 *
 * Jeder Baustein macht dreierlei: leeren Text zu `null`, die Eingabe in die
 * Form bringen, in der sie gespeichert wird, und erst dann prüfen.
 */
const MAX_TEXT = 200;

export function textField(max = MAX_TEXT) {
  return z
    .string()
    .max(max, `Höchstens ${max} Zeichen.`)
    .transform((value) => value.trim() || null);
}

export function requiredTextField(max = MAX_TEXT) {
  return z
    .string()
    .trim()
    .min(1, "Bitte ausfüllen.")
    .max(max, `Höchstens ${max} Zeichen.`);
}

const PICTOGRAPH = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

/** Genau ein Emoji, auch ein zusammengesetztes (👩‍🏫, 🇫🇷); leer heisst keins. */
export function isSingleEmoji(value: string): boolean {
  const graphemes = [
    ...new Intl.Segmenter("de", { granularity: "grapheme" }).segment(value),
  ];
  return graphemes.length === 1 && PICTOGRAPH.test(value);
}

export function emojiField() {
  return z
    .string()
    .trim()
    .max(32, "Ein Emoji, bitte.")
    .refine(
      (value) => value === "" || isSingleEmoji(value),
      "Ein Emoji, bitte.",
    )
    .transform((value) => value || null);
}

const KEINE_MAIL = "Das sieht nicht nach einer E-Mail-Adresse aus.";

// Die Länge vor dem Muster: Was länger als 254 Zeichen ist, ist keine Adresse.
const MAX_EMAIL = 254;

export function requiredEmailField() {
  return (
    z
      .string()
      .trim()
      .min(1, "Bitte ausfüllen.")
      .max(MAX_EMAIL, KEINE_MAIL)
      // Ganz klein: die Adresse ist hier Kennung des Kontos, kein Postfach.
      .transform((value) => normalizeEmail(value).toLowerCase())
      .pipe(z.email(KEINE_MAIL))
  );
}

/** Eine ganze Zahl in Grenzen, aus einem Textfeld. */
export function countField(label: string, min: number, max: number) {
  return z.string().transform((value, ctx) => {
    const eingabe = value.trim();
    const zahl = /^\d+$/.test(eingabe) ? Number(eingabe) : NaN;

    if (!Number.isInteger(zahl) || zahl < min || zahl > max) {
      ctx.addIssue({
        code: "custom",
        message: eingabe
          ? `${label}: eine Zahl von ${min} bis ${max}.`
          : `${label} fehlt.`,
      });
      return z.NEVER;
    }
    return zahl;
  });
}

const MAX_TAGS = 20;
const MAX_TAG = 40;

/**
 * Tags, durch Komma oder Leerzeichen getrennt: klein, ohne `#`, jeder einmal.
 * „Verb, Alltag" und „#verb alltag" ergeben dasselbe.
 */
export function normalizeTags(value: string): string[] {
  const tags = value
    .split(/[,\s]+/)
    .map((tag) => tag.replace(/^#+/, "").trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)];
}

export function tagsField() {
  return z
    .string()
    .transform(normalizeTags)
    .refine((tags) => tags.length <= MAX_TAGS, `Höchstens ${MAX_TAGS} Tags.`)
    .refine(
      (tags) => tags.every((tag) => tag.length <= MAX_TAG),
      `Ein Tag hat höchstens ${MAX_TAG} Zeichen.`,
    );
}

/** Der erste Einwand je Feld genügt; zwei Sätze unter einem Feld liest niemand. */
export function fieldMessages(error: z.ZodError): Record<string, string> {
  const messages: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !messages[key]) messages[key] = issue.message;
  }
  return messages;
}

/** Für Anzahlen: kein Trenner, kein Vorzeichen. */
export function keepDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Was ein Feld beim Tippen annimmt (`InputField`, `accepts`). */
export const INPUT_FILTERS = {
  digits: (value: string) => keepDigits(value).slice(0, 4),
} as const;

export type InputKind = keyof typeof INPUT_FILTERS;
