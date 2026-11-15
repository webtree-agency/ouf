/**
 * **Ab hier wird gesucht statt geklappt** (Entscheid Jann, 17.09.2026: ein
 * Auswahlfeld ist ein Suchfeld, sobald seine Liste aus Daten kommt). Eine
 * feste Liste aus dem Code — Status, Zeitraum, Rolle — bleibt darunter und
 * klappt; Kunden, Websites, Kantone und Kategorien kommen aus der Datenbank
 * und wachsen darüber. Die Zahl entscheidet, nicht der Aufrufer: So verhält
 * sich jedes Auswahlfeld gleich, ob Filter (`FilterSelect`) oder Formular
 * (`SelectField`), und keines kann es vergessen.
 *
 * Eigenes Modul ohne `"use client"`, damit der Wert auch in einer
 * Server-Komponente ein Wert bleibt (Brain: use-client-konstante-…).
 */
export const SEARCH_FROM = 10;
