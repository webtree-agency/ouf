"use client"; // Mikrofon des Browsers.

import { useEffect, useRef, useState } from "react";

// Ein Wort und seine Übersetzung dauern Sekunden; länger nimmt niemand eine Karte auf.
const MAX_MS = 30_000;

/**
 * Nimmt auf, bis `stop()` kommt oder 30 s um sind, und gibt die Aufnahme an
 * `onDone`. Safari liefert mp4, Chrome und Firefox webm; Whisper nimmt beides.
 */
export function useRecorder(onDone: (audio: Blob) => void) {
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => () => recorder.current?.stop(), []);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = [];
    const next = new MediaRecorder(stream);
    const timer = setTimeout(() => next.stop(), MAX_MS);
    next.ondataavailable = (event) => chunks.push(event.data);
    next.onstop = () => {
      clearTimeout(timer);
      stream.getTracks().forEach((track) => track.stop());
      recorder.current = null;
      setRecording(false);
      done.current(new Blob(chunks, { type: next.mimeType }));
    };
    recorder.current = next;
    next.start();
    setRecording(true);
  }

  return { recording, start, stop: () => recorder.current?.stop() };
}
