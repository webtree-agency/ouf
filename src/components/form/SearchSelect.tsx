"use client"; // Tippen, filtern, auswählen — alles im Browser.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Label from "@/components/form/Label";
import { ChevronDownIcon } from "@/icons";
import { useClickOutside } from "@/hooks/useClickOutside";

/** Wie hoch der Aufklapper höchstens wird — er entscheidet, ob er nach oben klappt. */
const MAX_HOEHE = 320;

/** Wie in der Suchpalette: kurz genug, dass es mitläuft, lang genug für den Server. */
const DEBOUNCE_MS = 200;

/** Darunter sucht niemand sinnvoll (`lib/search/types.ts`). */
const MIN_LAENGE = 2;

type Platz = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
};

export type Choice = {
  value: string;
  label: string;
  /**
   * Überschrift, unter der die Möglichkeit steht. Gleiche Werte in Folge
   * werden zusammengefasst — gebraucht, wo zweierlei in derselben Auswahl
   * steht: bei den Zahlungen die offenen Rechnungen und die Gründe, ohne
   * Rechnung abzuschliessen.
   */
  group?: string;
  /** Ein runder Farbpunkt vor dem Namen — die Art im Jahreskalender. */
  dot?: string;
};

function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300 dark:border-gray-600 ${className}`}
    />
  );
}

/**
 * Eine Auswahl, in der man tippen kann. **Ab etwa zwanzig Einträgen hört ein
 * `<select>` auf, eine Auswahl zu sein, und wird zu einer Liste, die man
 * absucht** — bei siebenundvierzig Kunden ist das jedes Mal Scrollen.
 *
 * Bewusst kein Paket: Was es können muss, ist Filtern, Pfeiltasten, Escape und
 * ein Klick daneben. Das ist weniger Code als die Anbindung einer Bibliothek,
 * und es sieht aus wie der Rest (§4).
 */
export default function SearchSelect({
  id,
  label,
  ariaLabel,
  choices,
  value,
  onChange,
  placeholder = "Suchen …",
  prompt,
  emptyLabel,
  onSearch,
  error = false,
  hint,
}: {
  id: string;
  /**
   * Die sichtbare Beschriftung. **Sie darf fehlen, wo die Spalte sie schon
   * trägt** — in einer Tabelle stünde sie sonst in jeder Zeile noch einmal.
   * Dann sagt `ariaLabel`, worum es geht.
   */
  label?: string;
  ariaLabel?: string;
  choices: Choice[];
  value: string | null;
  /** Was im Feld steht, solange nichts gewählt ist — „Art wählen". */
  prompt?: string;
  /**
   * Die gewählte Möglichkeit kommt mit. **Gebraucht beim Suchen auf dem
   * Server:** Dort steht die Beschriftung in keiner Liste, die der Aufrufer
   * hätte — ohne sie zeigte das geschlossene Feld nach der Wahl den
   * Platzhalter. Wer nur den Wert braucht, lässt den zweiten Wert stehen.
   */
  onChange: (value: string | null, choice?: Choice) => void;
  placeholder?: string;
  /** Der Eintrag für „nichts gewählt". Fehlt er, muss etwas gewählt werden. */
  emptyLabel?: string;
  /**
   * **Für Bestände, die nicht in den Browser passen.** Ohne diese Funktion
   * filtert die Auswahl `choices` im Browser — richtig bei siebenundvierzig
   * Kunden, unmöglich bei vierunddreissigtausend Leads. Mit ihr wird bei jedem
   * Tippen der Server gefragt, entprellt.
   *
   * `choices` bleibt daneben sichtbar und wird im Browser gefiltert — bei den
   * Terminen die Kunden, zu denen der Server die Adressen aus dem Postfach
   * legt. Wer nur auf dem Server sucht, gibt darin bloss das Gewählte mit,
   * damit seine Beschriftung im geschlossenen Feld stehen kann.
   */
  onSearch?: (query: string) => Promise<Choice[]>;
  /** Rot umrandet — wie bei `InputField`, damit ein Formular überall gleich meldet. */
  error?: boolean;
  /** Der Satz darunter: die Meldung, wenn `error`, sonst ein Hinweis. */
  hint?: string;
}) {
  const [offen, setOffen] = useState(false);
  const [suche, setSuche] = useState("");
  const [markiert, setMarkiert] = useState(0);
  const [platz, setPlatz] = useState<Platz | null>(null);
  const feld = useRef<HTMLDivElement>(null);
  const auslöser = useRef<HTMLButtonElement>(null);

  // Der Rahmen umschliesst den Auslöser mit: sonst schlösse der Aussenklick,
  // und derselbe Klick öffnete sofort wieder (§3).
  useClickOutside(feld, () => setOffen(false));

  /**
   * **Der Aufklapper hängt am `body`, nicht in der Zeile** (§3). In der
   * Zahlungsliste steckt er sonst in einem `overflow-x-auto` — und weil eine
   * Achse auf `auto` die andere mitnimmt, schneidet dieser Rahmen ihn unten ab:
   * Bei der letzten Zeile sah man das Suchfeld und keinen einzigen Treffer.
   *
   * Gemessen statt geraten, und **vor dem Bild** (`useLayoutEffect`), sonst
   * blitzt er einmal an der falschen Stelle auf.
   */
  useLayoutEffect(() => {
    // Geschlossen wird nichts zurückgesetzt: Gezeichnet wird der Aufklapper
    // ohnehin nur mit `offen`, und `useLayoutEffect` misst vor dem nächsten
    // Bild — der alte Wert kommt nie zur Ansicht.
    if (!offen) return;

    const messen = () => {
      const rahmen = auslöser.current?.getBoundingClientRect();
      if (!rahmen) return;

      const darunter = window.innerHeight - rahmen.bottom;
      setPlatz({
        left: rahmen.left,
        width: rahmen.width,
        // Nach oben nur, wenn es unten wirklich zu eng ist und oben mehr Platz
        // hat — sonst klappt er bei jedem Rand in die andere Richtung.
        ...(darunter < MAX_HOEHE && rahmen.top > darunter
          ? { bottom: window.innerHeight - rahmen.top + 4 }
          : { top: rahmen.bottom + 4 }),
      });
    };

    messen();
    // **Mitgehen statt schliessen:** Er klebt am Auslöser, nicht am Fenster —
    // und die Zeile, zu der er gehört, wandert beim Scrollen mit.
    window.addEventListener("scroll", messen, true);
    window.addEventListener("resize", messen);
    return () => {
      window.removeEventListener("scroll", messen, true);
      window.removeEventListener("resize", messen);
    };
  }, [offen]);

  const [gefunden, setGefunden] = useState<Choice[]>([]);

  /**
   * Nur mit `onSearch`. **Eine spätere Antwort darf eine frühere nicht
   * überholen** — dieselbe Vorkehrung wie in der Suchpalette, sonst zeigt die
   * Liste die Treffer zum vorletzten Buchstaben.
   */
  useEffect(() => {
    if (!onSearch) return;

    // Zu kurz: gar nicht erst fragen. **Nicht hier leeren** — ein `setState` im
    // Rumpf eines Effekts ist unter React 19 ein Fehler; was angezeigt wird,
    // entscheidet `gefiltert` weiter unten aus der Eingabe.
    const nadel = suche.trim();
    if (nadel.length < MIN_LAENGE) return;

    let live = true;
    const timer = setTimeout(async () => {
      const treffer = await onSearch(nadel);
      if (live) setGefunden(treffer);
    }, DEBOUNCE_MS);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [onSearch, suche]);

  const gefiltert = useMemo(() => {
    const nadel = suche.trim().toLowerCase();
    const lokal = nadel
      ? choices.filter((choice) => choice.label.toLowerCase().includes(nadel))
      : choices;
    // Was der Server findet, kommt hinter das Eigene — und nicht zweimal, wenn
    // er das Gewählte noch einmal zurückgibt.
    const vomServer =
      onSearch && nadel.length >= MIN_LAENGE
        ? gefunden.filter((hit) => !lokal.some((c) => c.value === hit.value))
        : [];
    const treffer = [...lokal, ...vomServer];

    return emptyLabel !== undefined && !nadel
      ? [{ value: "", label: emptyLabel }, ...treffer]
      : treffer;
  }, [choices, suche, emptyLabel, onSearch, gefunden]);

  const gewählt = choices.find((choice) => choice.value === value);

  function wähle(choice: Choice) {
    onChange(choice.value || null, choice.value ? choice : undefined);
    setOffen(false);
    setSuche("");
  }

  function taste(event: React.KeyboardEvent) {
    if (event.key === "Escape") return setOffen(false);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const schritt = event.key === "ArrowDown" ? 1 : -1;
      setMarkiert((jetzt) =>
        Math.min(Math.max(jetzt + schritt, 0), gefiltert.length - 1),
      );
      return;
    }
    if (event.key === "Enter" && gefiltert[markiert]) {
      event.preventDefault();
      wähle(gefiltert[markiert]);
    }
  }

  return (
    <div className="relative" ref={feld}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <button
        ref={auslöser}
        id={id}
        type="button"
        aria-label={label ? undefined : ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={offen}
        onClick={() => {
          setOffen((war) => !war);
          setSuche("");
          setMarkiert(0);
        }}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`shadow-theme-xs focus:ring-brand-500/20 text-theme-sm flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-4 text-left focus:ring-3 focus:outline-hidden dark:bg-gray-900 ${
          error
            ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500"
            : "focus:border-brand-500 border-gray-300 dark:border-gray-700"
        }`}
      >
        <span
          className={`flex min-w-0 items-center gap-2.5 ${
            gewählt ? "text-gray-800 dark:text-white/90" : "text-gray-400"
          }`}
        >
          {gewählt?.dot && <Dot className={gewählt.dot} />}
          <span className="truncate">
            {gewählt?.label ?? emptyLabel ?? prompt ?? placeholder}
          </span>
        </span>
        <ChevronDownIcon className="shrink-0 text-gray-500" />
      </button>

      {hint && (
        <p
          id={`${id}-hint`}
          className={`mt-1.5 text-xs ${
            error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}

      {offen &&
        platz &&
        createPortal(
          <div
            // Der Aussenklick horcht am `document`; hier endet die Reise,
            // sonst schlösse jeder Klick in der Liste den Aufklapper.
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            style={{
              left: platz.left,
              width: platz.width,
              ...(platz.top === undefined
                ? { bottom: platz.bottom }
                : { top: platz.top }),
            }}
            className="fixed z-99999 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <input
              autoFocus
              value={suche}
              placeholder={placeholder}
              onChange={(event) => {
                setSuche(event.target.value);
                setMarkiert(0);
              }}
              onKeyDown={taste}
              className="focus:border-brand-500 text-theme-sm h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 focus:outline-hidden dark:border-gray-700 dark:text-white/90"
            />

            <ul role="listbox" className="mt-2 max-h-60 overflow-y-auto">
              {gefiltert.length === 0 && (
                <li className="text-theme-sm px-3 py-2 text-gray-500 dark:text-gray-400">
                  {/* Beim Suchen auf dem Server steht am Anfang nichts da —
                      „kein Treffer für nichts" wäre die falsche Auskunft. */}
                  {onSearch && suche.trim().length < MIN_LAENGE
                    ? "Zum Suchen mindestens zwei Zeichen tippen."
                    : `Kein Treffer für „${suche}".`}
                </li>
              )}
              {gefiltert.map((choice, index) => (
                <li key={choice.value || "leer"}>
                  {choice.group &&
                    choice.group !== gefiltert[index - 1]?.group && (
                      <span className="text-theme-xs block px-3 pt-2 pb-1 font-medium text-gray-500 dark:text-gray-400">
                        {choice.group}
                      </span>
                    )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={choice.value === (value ?? "")}
                    onMouseEnter={() => setMarkiert(index)}
                    onClick={() => wähle(choice)}
                    className={`text-theme-sm flex w-full items-center gap-2.5 truncate rounded-md px-3 py-2.5 text-left ${
                      index === markiert
                        ? "bg-brand-50 dark:bg-brand-300/10 dark:text-brand-300 text-gray-900"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {choice.dot && <Dot className={choice.dot} />}
                    {choice.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
