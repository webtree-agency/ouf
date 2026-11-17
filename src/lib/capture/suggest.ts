import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { DomainError } from "../domainError.ts";
import type { LanguageProfile } from "../languages/catalog.ts";

/**
 * **Der einzige Ort, der Claude kennt** (§2, Adapter). Jede Antwort ist ein
 * Vorschlag; gespeichert wird erst, was man bestätigt.
 */

// Das kleinste Modell reicht für ein Wort und einen Satz (Jann, 16.11.2026).
const MODEL = "claude-haiku-5-5";

export type Tokens = { inputTokens: number; outputTokens: number };
export type Answer<T> = { value: T; tokens: Tokens };

async function ask<T>(
  system: string,
  input: string,
  schema: z.ZodType<T>,
): Promise<Answer<T> & { refused: boolean }> {
  const response = await new Anthropic().messages.parse({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: input }],
    output_config: { effort: "low", format: zodOutputFormat(schema) },
  });
  const tokens = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
  const value = response.parsed_output;
  if (response.stop_reason === "refusal" || !value)
    return { value: null as T, tokens, refused: true };
  return { value, tokens, refused: false };
}

const NOT_A_CARD = "Daraus liess sich keine Karte machen.";

export const cardSuggestion = z.object({
  front: z.string(),
  back: z.string(),
  gender: z.enum(["m", "f", ""]),
});
export type CardSuggestion = z.infer<typeof cardSuggestion>;

export function cardInstructions(language: LanguageProfile): string {
  return [
    `Du füllst eine Karteikarte zum ${language.name}lernen für eine deutschsprachige Person.`,
    `Du bekommst Diktiertes oder Getipptes. Darin steht ein Wort oder Ausdruck auf ${language.name}, auf Deutsch oder beides, manchmal mit falsch erkannten Wörtern.`,
    `front: der Ausdruck auf ${language.name}, so wie man ihn lernt, richtig geschrieben, ohne Punkt am Ende. Ein Nomen mit bestimmtem Artikel (le, la); nur wo er zu l' wird, mit un oder une, damit das Genus sichtbar bleibt. Steht nur Deutsch da, nimm das Wort, das man im Alltag sagt. Also «le vélo», «la bagnole», «un arbre» (nicht «l'arbre»).`,
    "back: die deutsche Bedeutung, knapp, ohne Punkt am Ende, ein Nomen mit Artikel. Steht schon eine Rückseite da, übernimm sie.",
    language.genders
      ? 'gender: "m" oder "f" bei einem Nomen, sonst "".'
      : 'gender: immer "".',
    "Ist kein Ausdruck zu erkennen, lass alle Felder leer.",
  ].join("\n");
}

export async function suggestCard(
  input: string,
  language: LanguageProfile,
): Promise<Answer<CardSuggestion>> {
  const answer = await ask(cardInstructions(language), input, cardSuggestion);
  if (answer.refused || !answer.value.front) throw new DomainError(NOT_A_CARD);
  return answer;
}

const exampleSuggestion = z.object({ example: z.string() });

export function exampleInstructions(language: LanguageProfile): string {
  return [
    `Schreib einen kurzen, alltäglichen Beispielsatz auf ${language.name} mit dem Ausdruck von der Vorderseite einer Karteikarte, so wie man ihn wirklich sagt.`,
    "Nur der Satz, ohne Übersetzung. Steht ein bisheriger Satz da, schreib einen anderen.",
  ].join("\n");
}

export async function suggestExample(
  card: { front: string; back: string; previous: string },
  language: LanguageProfile,
): Promise<Answer<string>> {
  const input = [
    `Vorderseite: ${card.front}`,
    card.back && `Rückseite: ${card.back}`,
    card.previous && `Bisheriger Satz: ${card.previous}`,
  ]
    .filter(Boolean)
    .join("\n");
  const answer = await ask(
    exampleInstructions(language),
    input,
    exampleSuggestion,
  );
  if (answer.refused || !answer.value.example)
    throw new DomainError("Dazu fiel kein Satz ein.");
  return { value: answer.value.example, tokens: answer.tokens };
}

const translation = z.object({
  back: z.string(),
  gender: z.enum(["m", "f", ""]),
});
export type Translation = z.infer<typeof translation>;

export function translationInstructions(language: LanguageProfile): string {
  return [
    `Übersetze einen Ausdruck auf ${language.name} von der Vorderseite einer Karteikarte ins Deutsche.`,
    "back: die deutsche Bedeutung, knapp, ohne Punkt am Ende, ein Nomen mit Artikel. Hat er mehrere übliche Bedeutungen, die zwei häufigsten mit Semikolon.",
    language.genders
      ? `gender: "m" oder "f", wenn es ein Nomen auf ${language.name} ist, sonst "".`
      : 'gender: immer "".',
    `Ist es kein Ausdruck auf ${language.name}, lass back leer.`,
    "Steht eine bisherige Übersetzung da, schlag eine andere vor.",
  ].join("\n");
}

export async function suggestTranslation(
  card: { front: string; previous: string },
  language: LanguageProfile,
): Promise<Answer<Translation | null>> {
  const input = card.previous
    ? `${card.front}\nBisherige Übersetzung: ${card.previous}`
    : card.front;
  const answer = await ask(
    translationInstructions(language),
    input,
    translation,
  );
  const usable = !answer.refused && answer.value.back.trim();
  return { value: usable ? answer.value : null, tokens: answer.tokens };
}

const genderGuess = z.object({ gender: z.enum(["m", "f", ""]) });

export function genderInstructions(language: LanguageProfile): string {
  return [
    `Welches Genus hat dieses Nomen auf ${language.name}? Ein Artikel kann fehlen oder zu l' verkürzt sein.`,
    'gender: "m" oder "f". Ist es kein Nomen oder nicht eindeutig, "".',
  ].join("\n");
}

export async function guessGender(
  front: string,
  language: LanguageProfile,
): Promise<Answer<"m" | "f" | null>> {
  const answer = await ask(genderInstructions(language), front, genderGuess);
  const gender = answer.refused ? "" : answer.value.gender;
  return { value: gender || null, tokens: answer.tokens };
}
