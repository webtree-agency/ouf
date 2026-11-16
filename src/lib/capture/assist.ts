import { getDb, schema } from "../../db/index.ts";
import { genderFromArticle } from "../cards/gender.ts";
import type { LanguageProfile } from "../languages/catalog.ts";
import { deeplConfigured, translateWithDeepl } from "./deepl.ts";
import {
  suggestCard,
  suggestExample,
  suggestTranslation,
  type Translation,
  type Answer,
  type CardSuggestion,
} from "./suggest.ts";
import { transcribe } from "./transcribe.ts";

type Task = (typeof schema.aiTask.enumValues)[number];

/** Jeder Aufruf wird aufgeschrieben, auch der ohne brauchbare Antwort: bezahlt ist er trotzdem. */
async function record(
  userId: string,
  task: Task,
  usage: { inputTokens?: number; outputTokens?: number; audioMs?: number },
) {
  await getDb()
    .insert(schema.aiUsage)
    .values({ userId, task, ...usage });
}

async function counted<T>(
  userId: string,
  task: Task,
  call: Promise<Answer<T>>,
): Promise<T> {
  const answer = await call;
  await record(userId, task, answer.tokens);
  return answer.value;
}

/** Diktat: erst die Abschrift, damit sie gleich grau in der Karte steht. */
export async function transcribeFor(
  userId: string,
  audio: Blob,
): Promise<string> {
  const { text, audioMs } = await transcribe(audio);
  await record(userId, "transcribe", { audioMs });
  return text;
}

/** Getippt oder neu vorgeschlagen: aus dem, was schon in den Feldern oder im Diktat steht. */
export async function cardFromText(
  userId: string,
  input: string,
  language: LanguageProfile,
): Promise<CardSuggestion> {
  return counted(userId, "card", suggestCard(input, language));
}

export async function exampleFor(
  userId: string,
  card: { front: string; back: string; previous: string },
  language: LanguageProfile,
): Promise<string> {
  return counted(userId, "example", suggestExample(card, language));
}

/**
 * Die Rückseite zur Vorderseite, auf Klick. Mit DeepL-Schlüssel übersetzt
 * DeepL (gratis); eine *andere* Übersetzung kann nur Claude, DeepL gäbe
 * dieselbe noch einmal.
 */
export async function translationFor(
  userId: string,
  card: { front: string; previous: string },
  language: LanguageProfile,
): Promise<Translation | null> {
  if (deeplConfigured() && !card.previous) {
    const back = await translateWithDeepl(card.front, language.code);
    if (back) {
      const gender = language.genders ? genderFromArticle(card.front) : null;
      return { back, gender: gender ?? "" };
    }
  }
  return counted(userId, "translate", suggestTranslation(card, language));
}
