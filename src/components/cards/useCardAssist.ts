"use client"; // Zustand der Vorschläge.

import { useState } from "react";

import {
  suggestCardAction,
  suggestExampleAction,
  suggestTranslationAction,
  transcribeAction,
} from "@/app/(app)/karten/actions";
import type { CardSuggestion } from "@/lib/capture/suggest";
import type { AssistField, FieldAssist } from "./fieldAssist";
import type { CardValues } from "./CardFields";

type Update = (next: (current: CardValues) => CardValues) => void;

/**
 * **Diktat und Vorschläge an einem Ort.** Was diktiert wurde, steht sofort
 * grau in der Vorderseite; die Felder atmen, bis der Vorschlag da ist, und
 * der kommt weich herein. Nichts wird ohne Enter gespeichert.
 */
export function useCardAssist({
  genders,
  update,
  focusFront,
}: {
  genders: boolean;
  update: Update;
  focusFront: () => void;
}) {
  const [loading, setLoading] = useState<ReadonlySet<AssistField>>(new Set());
  const [ghost, setGhost] = useState("");
  const [revealed, setRevealed] = useState<FieldAssist["revealed"]>({});
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<CardSuggestion | null>(null);

  const busy = loading.size > 0;
  const mark = (fields: AssistField[], on: boolean) =>
    setLoading((current) => {
      const next = new Set(current);
      fields.forEach((field) => (on ? next.add(field) : next.delete(field)));
      return next;
    });
  const reveal = (fields: AssistField[]) =>
    setRevealed((current) => {
      const next = { ...current };
      fields.forEach((field) => (next[field] = (next[field] ?? 0) + 1));
      return next;
    });

  async function card(text: string) {
    mark(["front", "back"], true);
    const result = await suggestCardAction({ text });
    mark(["front", "back"], false);
    setGhost("");
    if (!result.ok) return setError(result.message);
    const suggestion = result.data;
    setLast(suggestion);
    update((current) => ({
      ...current,
      front: suggestion.front,
      back: suggestion.back,
      gender: genders ? suggestion.gender : "",
      genderTouched: true,
    }));
    reveal(["front", "back"]);
    focusFront();
  }

  async function dictated(audio: Blob) {
    setError(null);
    setGhost("Wird abgeschrieben …");
    mark(["front", "back"], true);
    const form = new FormData();
    form.append("audio", audio);
    const result = await transcribeAction(form);
    if (!result.ok) {
      mark(["front", "back"], false);
      setGhost("");
      return setError(result.message);
    }
    setGhost(result.data);
    await card(result.data);
  }

  /** Aus dem, was in den Feldern steht; ein zweiter Klick will etwas anderes. */
  async function suggest(values: CardValues) {
    setError(null);
    const typed = [values.front, values.back].filter(Boolean).join(" · ");
    if (!typed) return setError("Zuerst ein Wort, getippt oder diktiert.");
    const again =
      last && last.front === values.front && last.back === values.back;
    await card(again ? `${typed}\nBitte einen anderen Vorschlag.` : typed);
  }

  async function example(values: CardValues) {
    setError(null);
    if (!values.front.trim()) return setError("Zuerst die Vorderseite.");
    mark(["example"], true);
    const result = await suggestExampleAction({
      front: values.front,
      back: values.back,
      previous: values.example,
    });
    mark(["example"], false);
    if (!result.ok) return setError(result.message);
    update((current) => ({ ...current, example: result.data }));
    reveal(["example"]);
  }

  async function translate(values: CardValues) {
    setError(null);
    if (!values.front.trim()) return setError("Zuerst die Vorderseite.");
    mark(["back"], true);
    const result = await suggestTranslationAction({
      front: values.front,
      previous: values.back,
    });
    mark(["back"], false);
    if (!result.ok) return setError(result.message);
    const found = result.data;
    if (!found) return setError("Dazu fand sich keine Übersetzung.");
    update((current) => ({
      ...current,
      back: found.back,
      gender:
        genders && !current.genderTouched && found.gender
          ? found.gender
          : current.gender,
    }));
    reveal(["back"]);
  }

  return {
    busy,
    translate,
    error,
    setError,
    dictated,
    suggest,
    example,
    hasSuggestion: last !== null,
    fields: { loading, ghost, revealed } satisfies Omit<
      FieldAssist,
      "frontHint" | "exampleAction" | "backAction"
    >,
  };
}
