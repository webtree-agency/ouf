# ouf. — Konzept

Karteikarten zum Sprachenlernen, im Kern Französisch. Wie Anki, nur mit weniger
Knöpfen. Eine Person, ein Konto, ihre Sprachen, ihre Decks.

## Seitenaufbau

Eine Kopfzeile mit Logo und Serie, am Handy auch **Sprachauswahl** und
Benutzermenü; am Laptop liegen die beiden in der Leiste unten. Die
Navigation schwebt als Pille aus Glas unten, auf jeder Breite; am Handy fehlt
sie beim Lernen. Keine Seitenleiste. Alles unter der Shell zeigt nur die gewählte
Sprache.

| Adresse                      | Inhalt                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| `/`                          | Begrüssung, „Heute" mit der Zahl und „Lernen", Decks mit dem, was offen ist |
| `/lernen` (`?deck=`)         | Eine Karte, aufdecken, bewerten. Ohne Deck alle Decks der Sprache           |
| `/karten`                    | Liste mit Suche, Filter Deck, Tag, Genus, blätternd, alles in der Adresse   |
| `/karten/neu` (`?deck=`)     | Schnellerfassung                                                            |
| `/karten/[id]`               | Karte bearbeiten oder löschen                                               |
| `/decks`                     | Decks der Sprache mit Zahlen, anlegen, umbenennen, Tageslimit, löschen      |
| `/statistik`                 | Kacheln, Prognose 14 Tage, Verlauf 30 Tage, je mit den Zahlen daneben       |
| `/daten`                     | Import und Export als CSV/TSV                                               |
| `/sprachen`                  | Sprachen anlegen und entfernen                                              |
| `/konto`                     | Name, Passkeys, Notfallweg, Geräte, Konto löschen                           |
| `/anmelden`, `/registrieren` | Passkey; `/anmelden/notfall` mit TOTP oder Ersatzcode                       |

Leerer Zustand führt weiter: ohne Sprache auf `/sprachen`, ohne Deck auf
`/decks`, ohne Karte auf `/karten/neu`.

## Datenmodell

```
users ─┬─ sessions · passkeys · totp_secrets · recovery_codes
       └─ languages ── decks ── cards ── card_schedules ── reviews ── review_undos
```

- **users**: E-Mail, Name, `active_language_id`. Kein Passwort, keine Rolle.
- **languages**: `code` (`fr` oder frei), Name, Sprechsprache (`fr-FR`). Was eine
  Sprache kann, steht im Code (`lib/languages/catalog.ts`): Französisch kennt
  Genus und Artikel, eine eigene Sprache nicht.
- **decks**: Name, `new_per_day` (Vorgabe 20). Gehört genau einer Sprache.
- **cards**: Vorderseite, Rückseite, Beispielsatz, Notiz, Tags (`text[]`), Genus
  (`m`, `f` oder leer), `reverse`. Der Artikel steht im Wort („la maison",
  „l'eau"), deshalb ist Genus ein eigenes Feld. `front_key` ist die normierte
  Vorderseite für die Dublettenprüfung.
- **card_schedules**: der FSRS-Stand je Richtung (`forward`, `reverse`).
  Eine Karte hat einen, mit Rückwärtskarte zwei.
- **reviews**: jede Bewertung, nur angefügt. Note, Zustand davor, Intervall danach,
  Dauer, dazu der vollständige Stand davor als `before` (für Rückgängig).
- **review_undos**: welche Bewertung zurückgenommen wurde, ebenfalls nur
  angefügt. Statistik zählt nur Bewertungen ohne Eintrag hier.

Jede Abfrage geht vom Konto aus: `languages.user_id`, `decks.user_id`,
`reviews.user_id`. Was eine Adresse oder ein Formular als Kennung bringt, wird
gegen die Sitzung geprüft, nie geglaubt.

## Lernlogik

Reine Funktionen in `lib/learning/`, ts-fsrs nur in `scheduler.ts`.

- **FSRS-6**, Zielbehalt 90 %, Lernschritte 1 und 10 Minuten, Wiederlernen
  10 Minuten, Streuung an (sie hängt an der Kennung, Vorschau und Bewertung
  stimmen also überein). FSRS-7 ist die neue Vorgabe von ts-fsrs, überspringt
  aber die Lernschritte; siehe `ENTSCHEIDE.md`.
- **Warteschlange**: zuerst, was in den Lernschritten fällig ist, dann fällige
  Wiederholungen nach Fälligkeit, dazwischen neue Karten bis zum Tageslimit des
  Decks. Was heute schon neu gelernt wurde, zählt gegen das Limit.
- **Tag** endet um Mitternacht in Europe/Zurich.
- **Bewerten** schreibt Stand und Protokoll in einer Transaktion.
  **Rückgängig** setzt den Stand aus `before` zurück und trägt die Rücknahme
  ein; das Protokoll selbst wird nie geändert.
- **Intervall** neben jedem Knopf: „1 Min", „10 Min", „2 Tage", „3 Monate", „1.5 Jahre".

## Bedienung

- **Lernen**: Leertaste oder Enter deckt auf, 1 bis 4 bewertet (Nochmal, Schwer,
  Gut, Leicht), Z nimmt die letzte Bewertung zurück. Am Handy liegen die Knöpfe
  unten, gross, im Daumenbereich. Vorlesen über die Sprachausgabe des Browsers in
  der Sprechsprache der Sprache, ohne fremden Dienst.
- **Schnellerfassung**: Vorderseite, Tab, Rückseite, Enter speichert. Danach steht
  der Fokus wieder vorne, das Deck bleibt gewählt (`?deck=`). Eine Dublette in
  der Sprache wird beim Tippen gemeldet, gespeichert werden darf sie trotzdem.
  „la …" setzt Genus weiblich, „le …" männlich, bei „l'…" wählt man selbst.
- **Diktat**: „Diktieren“, Wort sagen (gern mit Übersetzung), „Fertig“. Whisper
  schreibt ab, Claude Haiku füllt Vorder- und Rückseite, Genus und
  Beispielsatz vor; Enter speichert wie beim Tippen. Höchstens 30 Sekunden.
- **Listen** wie im Cockpit: Zustand in der Adresse, `scroll: false`, 10 · 30 ·
  50 · 100 je Seite.
- **Sprache wechseln**: Auswahl oben in der Shell, ein Klick. Gespeichert am
  Konto, gilt also auf jedem Gerät.
- **Anmeldung** wie im Cockpit: Passkey, Notfall mit TOTP oder Ersatzcode,
  gleitende Sitzung, Sperre nach fünf Fehlversuchen, frischer Faktor für
  Passkeys verwalten und Konto löschen. Registrieren: E-Mail und Name, Passkey,
  drin.
