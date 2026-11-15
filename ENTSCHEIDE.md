# Entscheide

Je Entscheid: was gilt, was verworfen wurde, warum. Neueste unten.

## Block 0

- **FSRS-6 statt FSRS-7.** ts-fsrs 6.0 nimmt von sich aus FSRS-7, und das
  überspringt bei „Gut" auf einer neuen Karte die Lernschritte (gemessen:
  direkt 4,8 Tage). Für Vokabeln ist der kurze Rücklauf nach 1 und 10 Minuten
  das, was man von Anki kennt. Verworfen: FSRS-7 mit `allowModelOverride: false`,
  das ist neuer und weniger erprobt, ohne dass wir den Vorteil brauchen.
- **Neue Schnittstelle `DefaultScheduler`, nicht `fsrs()`.** Die alte ist in 6.0
  als veraltet markiert. Sie liefert `dueAt` statt `due`.
- **Rückgängig ohne Löschen.** Das Protokoll ist nur angefügt; eine Rücknahme ist
  ein eigener Eintrag in `review_undos`, der Stand davor liegt als `before` in der
  Bewertung. Verworfen: die letzte Bewertung löschen, das bricht die Regel aus
  §8 und nimmt der Statistik die Spur.
- **Tag endet um Mitternacht in Europe/Zurich.** Verworfen: Ankis 4 Uhr und eine
  Zeitzone je Konto. Beides ist eine Einstellung mehr, die heute niemand braucht.
- **Aktive Sprache am Konto, nicht in der Adresse.** Sie gilt für jede Seite und
  jedes Gerät. Verworfen: `?sprache=` in jeder Adresse, das müsste jeder Link
  mitschleppen.
- **Sitzung gleitend 90 Tage, höchstens ein Jahr**, die Fristen der Kunden im
  Cockpit. Verworfen: die 12 Stunden der Webtree-Rollen. Wer abends fünf Minuten
  lernt, soll nicht jeden Tag einen Passkey zeigen.
- **Kein Aktivitätsprotokoll für die Anmeldung.** Im Cockpit sehen zwei Admins
  einander; hier gibt es niemanden, der es liest. Anmeldungen, Fehlversuche und
  Sperren gehen in den Logger. Verworfen: die Tabelle `activities` mitnehmen.
- **Konto löschen löscht alles.** Im Cockpit werden Konten deaktiviert, weil der
  Verlauf seinen Urheber braucht. Hier gehören die Daten der Person, und wer
  geht, nimmt sie mit. Der Schutz des Protokolls lässt das nur in dieser einen
  Transaktion zu.

## Block 1

- **Eigene Ports: App 3400, E2E 3401, DB 5440 und 5441.** Das Cockpit belegt
  3000, 5433 und 5434 auf demselben Rechner. Ein E2E-Lauf startet immer einen
  eigenen Server (`reuseExistingServer: false`), statt einen gefundenen zu
  prüfen.
- **Icons mit dem Chromium von Playwright gerendert** (`pnpm icons`). Verworfen:
  `sharp` als eigenes Paket. Playwright ist für die Tests ohnehin da.
- **Wortmarke als Pfade, nicht als Text.** So hängt das Logo an keiner geladenen
  Schrift. Verworfen: `<text>` mit Geist im SVG; im PNG fiele es auf eine
  Systemschrift zurück.
- **Dunkelmodus folgt zuerst dem System** (`auto`), der Schalter im
  Benutzermenü legt ihn fest. Im Cockpit ist Hell die Vorgabe; gelernt wird
  oft abends.
- **Geist über `next/font/google`.** Die Schrift wird beim Bauen geladen und
  von ouf. selbst ausgeliefert; zur Laufzeit fragt kein Browser bei Google an.
  Verworfen: das Paket `geist`, ein Paket mehr für dieselbe Datei.
- **`"type": "module"` in `package.json`.** Node 24 warnt sonst bei jedem
  Testlauf, dass es die Dateien zweimal liest.
- **E-Mail ganz klein.** Die Adresse ist hier Kennung des Kontos. Im Cockpit
  bleibt der Teil vor dem @ unverändert, weil dorthin Mails gehen.
- **Bausteine gekürzt übernommen.** `fields.ts` kennt nur Text, Pflichttext,
  E-Mail, Anzahl und Tags; `PageHeading` ohne Spur und Reiter;
  Sicherheitskopfzeilen ohne die Ausnahmen des Cockpits. Was hier nicht
  gebraucht wird, liegt im Cockpit.
