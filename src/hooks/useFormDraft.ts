"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { callAction } from "@/lib/actions/call";
import type { ActionResult } from "@/lib/actionResult";
import {
  type Draft,
  draftStorageKey,
  parseDraft,
  sameValues,
  serializeDraft,
} from "@/lib/forms/draft";

export type FormDraft<T> = {
  values: T;
  setValues: (next: T | ((current: T) => T)) => void;
  /** Wann der gezeigte Stand gemerkt wurde. `null` heisst: er kommt vom Server. */
  restoredAt: number | null;
  /** Zurück auf den Stand des Servers, der gemerkte ist danach weg. */
  discard: () => void;
  /**
   * Die Aktion abschicken. Gelingt sie, ist der gemerkte Stand weg; scheitert
   * oder wirft sie, steht er weiter da. **Das ist der einzige Weg hinaus**,
   * damit niemand das eine ohne das andere schreibt.
   */
  submit: (run: () => Promise<ActionResult>) => Promise<ActionResult>;
};

/**
 * **Das Formular merkt sich, was drinsteht, bis es gespeichert ist.**
 * `useState` an seiner Stelle verliert alles, sobald die Seite neu lädt oder
 * eine geworfene Aktion die Fehlergrenze zeigt (`lib/forms/draft.ts`).
 *
 * Der gemerkte Stand ersetzt den des Servers beim Aufbau der Seite, und die
 * Wiederherstellung wird angeschrieben: Text, der ohne Zutun im Formular steht,
 * ist sonst genau das Verhalten, das überrascht (§3).
 *
 * **Vergessen wird beim Abschicken, nicht danach.** Eine geglückte Aktion endet
 * mit einem Aufruf (§2) und kommt hier nie wieder an — es gibt also keinen
 * späteren Moment, in dem sich aufräumen liesse. Deshalb geht das Abschicken
 * durch `submit()`: Es vergisst vorher und merkt sich wieder, wenn die Aktion
 * abgewiesen wird oder wirft.
 */
export function useFormDraft<T>(key: string, initial: T): FormDraft<T> {
  const stored = useStoredDraft<T>(key);
  const [typed, setTyped] = useState<{
    values: T;
    restoredAt: number | null;
  } | null>(null);
  const [dropped, setDropped] = useState(false);
  const [saving, setSaving] = useState(false);

  const wiederherstellbar =
    !dropped && stored && !sameValues(stored.values, initial) ? stored : null;

  const values = typed ? typed.values : (wiederherstellbar?.values ?? initial);
  const restoredAt = typed
    ? typed.restoredAt
    : (wiederherstellbar?.savedAt ?? null);

  // Der laufende Zähler liegt in einem Ref, damit `forget()` ihn **sofort**
  // anhält: Wer im Chat tippt und gleich Enter drückt, schickt ab, bevor die
  // 400 ms um sind — und der Zähler schrieb den Text danach wieder hin, obwohl
  // die Nachricht längst draussen war (18.09.2026).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!typed || saving) return;

    // Getippt wird schnell, geschrieben wird selten (§3, entprellt).
    timer.current = setTimeout(() => write(key, typed.values), 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, typed, saving]);

  const setValues = useCallback(
    (next: T | ((current: T) => T)) =>
      setTyped((current) => {
        const base = current ? current.values : values;
        return {
          values:
            typeof next === "function"
              ? (next as (current: T) => T)(base)
              : next,
          restoredAt: current ? current.restoredAt : restoredAt,
        };
      }),
    [values, restoredAt],
  );

  const forget = useCallback(() => {
    // Erst den gezeigten Stand festhalten, dann löschen: Sonst fiele ein
    // wiederhergestelltes Formular beim Abschicken auf den Stand des Servers
    // zurück, weil es seine Werte aus dem Speicher liest.
    setTyped((current) => current ?? { values, restoredAt });
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    remove(key);
  }, [key, values, restoredAt]);

  const submit = useCallback(
    async (run: () => Promise<ActionResult>) => {
      forget();
      const result = await callAction(run);
      if (result.ok) return result;

      // Sofort und nicht erst entprellt: Wer die Meldung liest und gleich neu
      // lädt, wäre sonst schneller als das Merken.
      setSaving(false);
      write(key, values);
      return result;
    },
    [forget, key, values],
  );

  const discard = useCallback(() => {
    setTyped(null);
    setDropped(true);
    remove(key);
  }, [key]);

  return { values, setValues, restoredAt, discard, submit };
}

/*
 * `localStorage` ist Zustand ausserhalb von React — deshalb `useSyncExternalStore`
 * und nicht Lesen in einem Effect: Der Server und der erste Aufbau im Browser
 * zeigen denselben Stand, und erst danach kommt der gemerkte dazu.
 */
const listeners = new Set<() => void>();
const cache = new Map<
  string,
  { raw: string | null; draft: Draft<never> | null }
>();

function useStoredDraft<T>(key: string): Draft<T> | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot<T>(key),
    () => null,
  );
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Ein anderer Tab meldet sich nur über dieses Ereignis.
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * `useSyncExternalStore` vergleicht die Rückgabe mit `Object.is` — frisch
 * geparst wäre jedes Mal ein neues Objekt und das Formular liefe im Kreis.
 */
function snapshot<T>(key: string): Draft<T> | null {
  const raw = read(key);
  const known = cache.get(key);
  if (known && known.raw === raw) return known.draft as Draft<T> | null;

  const draft = parseDraft<T>(raw, Date.now());
  cache.set(key, { raw, draft: draft as Draft<never> | null });
  return draft;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(draftStorageKey(key));
  } catch {
    // Gesperrter Speicher ist kein Grund, das Formular zu verweigern.
    return null;
  }
}

function write<T>(key: string, values: T): void {
  try {
    localStorage.setItem(
      draftStorageKey(key),
      serializeDraft(values, Date.now()),
    );
  } catch {
    // Ein voller Speicher darf das Tippen nicht unterbrechen.
  }
  for (const listener of listeners) listener();
}

function remove(key: string): void {
  try {
    localStorage.removeItem(draftStorageKey(key));
  } catch {
    // Siehe oben.
  }
  for (const listener of listeners) listener();
}
