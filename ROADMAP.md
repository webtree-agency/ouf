# ouf. — Roadmap

## Stand am Morgen (16.11.2026)

**Fertig:** Blöcke 0 bis 7, je getestet, committet und nach `origin/main`
gepusht. Zum Schluss grün: typecheck, lint, format, 162 Unit-Tests,
60 Integrationstests, Build, 7 E2E-Tests gegen einen frisch gebauten Server
(Registrieren und Anmelden, vergebene Adresse, Schnellerfassung, Liste mit
Filter und Zurück, Lernrunde mit Rückgängig, Sicherheitskopfzeilen,
Manifest). Jede Seite bei 375, 768 und 1440 px, hell und dunkel, angesehen.

**Nicht gebaut, mit Grund:**

- **Import aus Anki (`.apkg`).** Bräuchte ein ZIP- und ein SQLite-Paket
  (sql.js mit WebAssembly); beides ist nicht unvermeidbar, weil Anki „Notizen
  als Text" exportiert und ouf. das einliest, HTML inklusive.
- **Offline.** Kein Service Worker; ouf. braucht die Datenbank. Installieren
  geht trotzdem, am Laptop über Chrome oder Edge, am iPhone über „Zum
  Home-Bildschirm".
- **Am echten iPhone nicht geprüft:** Installation und Passkey in der
  installierten App. Geprüft sind Manifest, Icons und Kopfzeilen; Passkeys
  im E2E nur in Chromium (den virtuellen Authenticator gibt es nur dort).
- **Ausgeliefert auf `ouf.webtree.ch`** (Dokploy, Compose mit Postgres,
  Backup auf R2). Registrieren kann nur, wer in `SIGNUP_EMAILS` steht.

**Bewusste Abweichungen vom Cockpit** stehen in `ENTSCHEIDE.md`: keine Rollen,
kein Aktivitätsprotokoll, Sitzung 90 Tage, Konto löschen löscht alles, keine
gegenseitige Wiederherstellung. Das Deck-Formular (zwei Felder im Dialog)
merkt sich keinen Entwurf.

## Offene Fragen an Jann

1. **Sitzung 90 Tage gleitend** (wie die Kunden im Cockpit) statt 12 Stunden.
   Passt das?
2. **Dunkelmodus folgt dem System**, im Cockpit ist Hell die Vorgabe. So
   lassen?
3. **Weitere Sprachen mit Genus?** Italienisch, Spanisch und Portugiesisch
   haben eines; vorbereitet ist auf Wunsch nur Französisch.
4. **Das Logo** ist von Hand gezeichnet (Pfade in
   `components/brand/logoPaths.ts`). Gefällt die Pinselfläche, oder soll eine
   Grafikerin ran?
5. **`.apkg`** doch bauen, mit den zwei Paketen?

## Prüfliste

```bash
cd ~/Documents/SaaS/ouf
docker compose up -d postgres postgres-test
pnpm db:migrate
pnpm dev:seed --verlauf        # Konto jann@ouf.local, zwei Decks, 30 Tage Verlauf
pnpm dev                       # http://localhost:3400
```

`.env.local` liegt bereit (`DEV_LOGIN_EMAIL=jann@ouf.local`). Auf
`/anmelden` steht dann „Lokal anmelden als jann@ouf.local".

| Seite                                               | Was prüfen                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [/anmelden](http://localhost:3400/anmelden)         | Lokal anmelden; „Konto anlegen" und „Ohne Passkey anmelden" führen weiter                 |
| [/registrieren](http://localhost:3400/registrieren) | Mit Touch ID ein zweites Konto anlegen (andere Adresse), landet auf `/sprachen`           |
| [/](http://localhost:3400/)                         | Vier Kacheln mit Vergleich, Decks mit „Lernen"                                            |
| [/lernen](http://localhost:3400/lernen)             | Leertaste deckt auf, 1 bis 4 bewertet, Z nimmt zurück, V liest vor; am Handy Knöpfe unten |
| [/karten](http://localhost:3400/karten)             | Suche, Deck, Tag, Genus; Seite 2, dann eine Karte öffnen und zurück: Filter bleibt        |
| [/karten/neu](http://localhost:3400/karten/neu)     | „la …" setzt Genus, Tab, Enter; Fokus wieder vorne; „la maison" meldet die Dublette       |
| [/decks](http://localhost:3400/decks)               | Neues Deck, Tageslimit ändern, löschen                                                    |
| [/statistik](http://localhost:3400/statistik)       | Prognose 14 Tage und Verlauf 30 Tage, Zahlen daneben                                      |
| [/daten](http://localhost:3400/daten)               | Export als CSV und TSV, die Datei wieder importieren: alles „gab es schon"                |
| [/sprachen](http://localhost:3400/sprachen)         | Englisch hinzufügen, oben in der Shell hin- und herwechseln                               |
| [/konto](http://localhost:3400/konto)               | Code-App einrichten (QR), zehn Ersatzcodes, Konto löschen mit Adresse                     |

Installieren: in Chrome das Symbol rechts in der Adressleiste. Tests:
`pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e` (baut selbst,
Port 3401).

## Blöcke

| Block | Inhalt                                                                 | Stand                |
| ----- | ---------------------------------------------------------------------- | -------------------- |
| 0     | KONZEPT.md, ROADMAP.md                                                 | fertig               |
| 1     | Gerüst: Stack, Tests, Tokens, Logo, Icons, Shell, Dark Mode, CLAUDE.md | fertig               |
| 2     | Konto und Anmeldung, Integrationstest zur Trennung der Konten          | fertig               |
| 3     | Sprachen, Decks, Karten, Schnellerfassung                              | fertig               |
| 4     | Lernen mit FSRS                                                        | fertig               |
| 5     | Übersicht und Statistik                                                | fertig               |
| 6     | Installierbar, Import und Export (CSV/TSV)                             | fertig, ohne `.apkg` |
| 7     | Schleifen: jede Seite gegen „Was man nicht sieht, aber sofort merkt"   | fertig               |
