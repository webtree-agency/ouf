"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

const noop = () => () => {};

/** Eine Stimme der Sprache; die besseren („Premium“, „Enhanced“) zuerst. */
function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | undefined {
  const prefix = lang.split("-")[0];
  const matching = voices.filter(
    (voice) => voice.lang.replace("_", "-") === lang,
  );
  const pool = matching.length
    ? matching
    : voices.filter((voice) => voice.lang.startsWith(prefix));
  return (
    pool.find((voice) => /premium|enhanced|erweitert/i.test(voice.name)) ??
    pool.find((voice) => voice.localService) ??
    pool[0]
  );
}

/**
 * Vorlesen mit der Sprachausgabe des Geräts, ohne fremden Dienst; am iPhone
 * sind das die Siri-Stimmen. Gibt es sie nicht, gibt es auch keinen Knopf.
 */
export function useSpeech(lang: string) {
  const available = useSyncExternalStore(
    noop,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
  // Safari liefert die Stimmen erst nach `voiceschanged`; der erste Aufruf fände sonst keine.
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!available) return;
    const synth = window.speechSynthesis;
    const load = () => {
      voices.current = synth.getVoices();
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, [available]);

  const speak = useCallback(
    (text: string) => {
      if (!available || !text) return;
      const synth = window.speechSynthesis;
      // Nur abbrechen, wenn etwas läuft: Safari verschluckt sonst den nächsten Satz.
      if (synth.speaking || synth.pending) synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      const voice = pickVoice(
        voices.current.length ? voices.current : synth.getVoices(),
        lang,
      );
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      // Chrome hängt manchmal im Pausenzustand; ohne `resume` bliebe es stumm.
      synth.resume();
      synth.speak(utterance);
    },
    [available, lang],
  );

  return { available, speak };
}
