"use client";

import { useCallback, useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Vorlesen mit der Sprachausgabe des Browsers, ohne fremden Dienst. Gibt es
 * sie nicht, gibt es auch keinen Knopf.
 */
export function useSpeech(lang: string) {
  const available = useSyncExternalStore(
    noop,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );

  const speak = useCallback(
    (text: string) => {
      if (!available || !text) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      const prefix = lang.split("-")[0];
      const voice =
        synth.getVoices().find((entry) => entry.lang === lang) ??
        synth.getVoices().find((entry) => entry.lang.startsWith(prefix));
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      synth.speak(utterance);
    },
    [available, lang],
  );

  return { available, speak };
}
