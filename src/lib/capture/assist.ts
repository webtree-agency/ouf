import { getDb, schema } from "../../db/index.ts";
import type { LanguageProfile } from "../languages/catalog.ts";
import {
  suggestCard,
  suggestExample,
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
