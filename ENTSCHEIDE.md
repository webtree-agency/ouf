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
