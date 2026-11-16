# ouf. — Arbeitsanweisungen

Karteikarten zum Sprachenlernen. Next.js 16 (App Router), TypeScript strict,
Tailwind v4, Drizzle mit Postgres 16, ts-fsrs.

**Diese Datei ist verbindlich.** Sie ist ein Auszug aus der `CLAUDE.md` des
Webtree Cockpits (`~/Documents/Webtree/Intern/webtree-cockpit`) mit denselben
Abschnitten und Regeln. Weggelassen ist, was nur Webtree betrifft: Kunden,
Kundencenter, Rollen und Rechte, Finanzen, Mails, ClickUp, Staging, Dokploy.
Was das Cockpit zu einem Punkt ausführlicher sagt, gilt hier auch.

**Was gebaut wird und in welcher Reihenfolge, steht in `ROADMAP.md`**, der
Aufbau in `KONZEPT.md`, Farben und Regeln dazu in `DESIGN.md`, getroffene
Entscheide in `ENTSCHEIDE.md`.

**Ein Auftrag ist nie nur das, was dasteht.** „Baue eine Liste" heisst auch:
sie springt beim Filtern nicht nach oben, der Zurück-Knopf bringt den Filter
mit, es ist immer nur ein Menü offen. Diese Dinge stehen in §3, „Was man nicht
sieht, aber sofort merkt", und werden **mitgebaut, nicht nachgereicht.**

**Weniger ist mehr.** Keine Gamification ausser der Serie in der Kopfzeile
(Jann, 16.11.2026), keine Abzeichen, keine Einstellungsseite
voller Schalter. Eine Einstellung gibt es nur, wenn ohne sie etwas nicht geht.
Pro Deck ist das das Tageslimit für neue Karten, sonst nichts.

---

## 1. Die fünf Grundregeln

1. **Erst schauen, dann bauen.** Vor jeder Komponente, Funktion oder Route
   prüfen, ob es das schon gibt: `src/components/`, `src/lib/`, `src/hooks/`.
   Fehlt ein Baustein, zuerst im Cockpit nachsehen, wie er dort gelöst ist.
2. **Nichts erfinden.** Keine neue Farbe, Schriftgrösse, kein Abstand und kein
   Muster, das nicht in `DESIGN.md` und `globals.css` steht.
3. **Vorhandene Bausteine nutzen.** Gibt es einen Knopf, ein Feld, ein Modal,
   wird es genommen, nicht nachgebaut.
4. **Immer planen.** Bei mehr als einer Datei: erst Plan, dann Code.
5. **Ein Block, fertig, getestet.** Ein Feature ganz, mit Tests, Linter und
   Responsiveness, dann das nächste.

---

## 2. Clean Code

### DRY

- Ein Stück Logik existiert **einmal**. Zweite Verwendung → nach `src/lib/`.
- Dreimal dasselbe Markup → Komponente.

### Dateigrössen (harte Grenzen)

| Typ          | Maximum    | Bei Überschreitung                                       |
| ------------ | ---------- | -------------------------------------------------------- |
| `page.tsx`   | 150 Zeilen | Nur Komposition. Daten → `lib/queries/`, Markup → eigene |
| Komponente   | 200 Zeilen | aufteilen                                                |
| `lib/`-Modul | 300 Zeilen | nach Zuständigkeit trennen                               |
| Funktion     | 50 Zeilen  | zerlegen                                                 |

### Struktur

- **Server Components sind der Default.** `'use client'` nur bei Interaktion,
  mit einem Wort Begründung im Kopfkommentar.
- **Mutationen laufen über Server Actions.** API-Routen nur für eine
  Leseanfrage, die während des Tippens läuft (Dublettenprüfung), und für
  Downloads (Export). Next schickt Aktionen je Client eine nach der anderen.
- **Eine geglückte Mutation endet mit `redirect()` auf die Seite, die das
  Ergebnis zeigt.** Steht das Ergebnis auf derselben Seite und muss der Fokus
  bleiben (Schnellerfassung, Lernen), gibt die Aktion einen Wert zurück und ruft
  `revalidatePath()`; Next liefert die neue Ansicht in derselben Antwort mit.
- **Datenzugriff nur in `lib/queries/<bereich>.ts`** oder in der Fachlogik
  unter `lib/<bereich>/`. Nie `db.select()` in einer Komponente.
- **Jede Server Action läuft durch `runAction()`** (`lib/actions/run.ts`):
  Sitzung, wahlweise frischer Faktor, Fachfehler als Meldung, Erneuern, Aufruf.
  Was der Benutzer lesen darf, wirft der Fachbereich als `DomainError`. **Eine
  Aktion, die den Wächter umgeht, wird nicht gemerged.** Ausnahme sind die
  Anmeldeaktionen selbst, die keine Sitzung haben können.
- **Jede API-Route bekommt `withUser()`** (`lib/http/withUser.ts`).
- **Jede Abfrage geht vom Konto aus.** Eine Kennung aus Adresse oder Formular
  ist eine Behauptung; geprüft wird, ob sie dem Konto aus der Sitzung gehört.
- **Jede Liste blättert und lässt ihre Grösse wählen**, keine feste Obergrenze:
  `lib/queries/paginate.ts`, `ui/pagination/Pagination.tsx`,
  `common/PerPageSelect.tsx` (10 · 30 · 50 · 100). Gefiltert, sortiert und
  geblättert wird in der Abfrage. Eine Sortierung bekommt immer eine zweite
  Spalte.
- **Was aus der Adresse kommt, wird geprüft**, bevor es in eine Abfrage geht.
- **Mehrere zusammengehörige Writes → `db.transaction()`.** Immer.
- **Input wird mit zod validiert**, an der Systemgrenze. Ein Feld bekommt
  seine Art aus `lib/validation/fields.ts`; kein eigener Ausdruck, keine
  eigene Meldung.

### Schreibweise der Marke

**„ouf." — immer klein, immer mit Punkt**, auch am Satzanfang. Ausgenommen
sind technische Bezeichner (`ouf`, Paketname, Cookie).

### Benennung

- Deutsch in UI-Texten und Kommentaren, Englisch im Code.
- Komponenten `PascalCase`, sonst `camelCase`, Dateien wie ihr Haupt-Export.
- Fachlich benennen: `dueToday`, nicht `data2`.

### YAGNI

Keine Abstraktion vor der dritten Verwendung, keine Option „für später",
keine Spalte auf Vorrat, kein Zwischenspeicher ohne gemessenes Problem.
Im Zweifel die einfachste Lösung, die den heutigen Fall ganz löst.

### Was Code änderbar macht

- Klare Grenzen: UI kennt keine Datenbank, Fachlogik kein HTTP und kein React.
- Abhängigkeiten zeigen nach innen: `UI → lib → db`. Nie zurück.
- **Fremde Bibliotheken hinter einem dünnen Adapter**: `@simplewebauthn` nur in
  `lib/auth/passkey.ts`, ts-fsrs nur in `lib/learning/scheduler.ts`.
- Reine Funktionen, wo möglich. Keine Wahrheits-Duplikate.

### Kommentare — so wenig wie möglich

Ein Kommentar sagt das Warum, nie das Was. Eine Zeile, ausnahmsweise zwei.

### Verboten

- `any`, `@ts-ignore`, `as unknown as`
- `console.log` im Produktivcode (→ `lib/logger.ts`)
- Inline-Styles, `!important`, magische Zahlen im Markup
- Eigene Farb- und Grössenwerte im Markup (`text-[13px]`, `bg-[#abc]`)
- `hover:underline` an einem Link → `link-brand`, `link-underline`
- **Bilder ins Repo legen.** Screenshots gehören in den Scratchpad. Ausnahme
  sind die Bilder, die die Anwendung ausliefert (Icons in `src/app/`).

---

## 3. Design-System

Alles steht in `src/app/globals.css`, erklärt in `DESIGN.md`. **Nur diese Werte.**

### Farbrollen

| Rolle   | Skala              | Wofür                            |
| ------- | ------------------ | -------------------------------- |
| Primär  | `brand-*`          | Aktionen, aktive Zustände, Marke |
| Neutral | `gray-*`, `canvas` | Text, Rahmen, Flächen            |
| Erfolg  | `success-*`        | geglückt                         |
| Fehler  | `error-*`          | Fehler, Löschen                  |
| Warnung | `warning-*`        | Achtung, Dublette                |

**Das Pastellblau `brand-300` ist auf Hell Fläche, nie Text.** Knöpfe auf Hell
sind Tinte (`gray-800`, weisse Schrift), Links Tinte mit pastellblauer Linie;
im Dunkelmodus `brand-300` mit dunkler Schrift. Das mittlere Blau
(`brand-500` bis `brand-700`) kommt in der Oberfläche nicht vor. Werte und
Kontraste in `DESIGN.md`.

### Schriftgrössen — abschliessende Liste

Schrift: **Outfit**, wie das Logo: Regular (400), Medium (500), SemiBold (600)
nur für Überschriften und Eyebrows. Keine zweite.

| Klasse           | Grösse | Wofür                      |
| ---------------- | ------ | -------------------------- |
| `text-title-2xl` | 72/90  | nur die Karte beim Lernen  |
| `text-title-xl`  | 60/72  | nur Fehlerseiten           |
| `text-title-lg`  | 48/60  | Karte beim Lernen am Handy |
| `text-title-md`  | 36/44  | KPI-Zahl                   |
| `text-title-sm`  | 30/38  | Seitentitel                |
| `text-theme-xl`  | 20/30  | Karten-Überschrift         |
| `text-base`      | 16/24  | Fliesstext                 |
| `text-theme-sm`  | 14/20  | **Standard in UI**         |
| `text-theme-xs`  | 12/18  | Labels, Meta, Badges       |

### Icons

**Ausschliesslich aus `src/icons/`**, dem Satz aus dem Cockpit. Keine zweite
Bibliothek, kein Emoji. Ausnahme ist das Emoji, das man einem Deck selbst gibt. Sparsam: Navigation, Aktionsknöpfe, Leerzustände.
Icons ohne Beschriftung brauchen `aria-label`.

### Links

`link-brand` (der Link ist die Aktion) und `link-underline` (nebenbei ein
Link), sonst nichts. Knöpfe bleiben Knöpfe (`ui/button/Button`).

### Texte in der Oberfläche

**Per du, sachlich, und nur wo sie eine Frage beantworten**, die die Ansicht
nicht selbst beantwortet. Kein Untertitel, der den Titel wiederholt. Keine
Platzhalter mit Beispielwerten, wenn das Feld beschriftet ist. Kein Werbeton,
kein Zuspruch, keine Ausrufezeichen, kein Emoji, kein Gedankenstrich als
Nachsatz, keine Dreiklänge. Ein Satz sagt eine Sache. **Die Prüfung: Satz
streichen und schauen, ob jemand ihn vermisst.**

### Kennzahlen und Diagramme

Aufbau einer Übersicht: **Kacheln** (drei bis fünf Zahlen, `text-title-md`, mit
Vergleich) · **Diagramm** · **Liste**. Eine Zahl ohne Vergleich ist eine halbe
Zahl. Kein Diagramm mit zwei Datenpunkten. Gerechnet wird in der Abfrage.
**ApexCharts, sonst nichts**, `'use client'`, beide Modi
(`components/charts/chartTheme.ts`). **Die Zahlen stehen neben dem Diagramm,
nicht im Tooltip** (`tooltip.enabled: false`, `legend.show: false`): Auf dem
Handy gibt es kein Darüberfahren.

### Seitenbreite

Die Breite wird einmal begrenzt, in der Shell. Eine Seite setzt kein zweites
`max-w-*` und kein `mx-auto`. Ausnahme ist die Lernkarte, die wie ein Blatt in
der Mitte steht.

### Breakpoints

`2xsm` 375 · `xsm` 425 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536

### Dark Mode

Über die Klasse `.dark`. **Jede Komponente wird in beiden Modi gebaut und
geprüft.** Dunkel heisst ruhig und nahezu schwarz: `dark:bg-gray-950` als Grund,
`dark:bg-gray-900` für Flächen, `dark:border-gray-800`.

### Responsiveness

Mobile first. Jede Seite bei **375, 768 und 1440 px** geprüft. Touch-Ziele
≥ 44 px, Knöpfe und Felder `h-11`. Tabellen scrollen in sich, nie die Seite.

### Überlagerungen

Eine Überlagerung deckt alles ab, Kopfzeile und Leiste unten inklusive; sie wird
dort eingehängt, wo kein Vorfahr einen Stapelkontext aufmacht (Shell oder
Portal). Die Antwort auf einen Klick steht dort, wo der Klick war. Die frische
Bestätigung ist ein eigener Dialog über allem (`ReauthDialog`).

### Ein Screenshot ist nur dann ein Beweis, wenn man das Drumherum ansieht

Bei jedem Bild drei Fragen: **Was ist daneben? Was war vorher da? Was fehlt
still?** Screenshots liegen im Scratchpad, nie im Repo.

### Was man nicht sieht, aber sofort merkt

- **Der Zustand der Ansicht steht in der Adresse.** Filter, Suche, Seite, Anzahl
  je Seite. Der Zurück-Knopf bringt die Liste zurück, die man verlassen hat.
- **Die Seite kommt sofort.** Jede Seite hat ein `loading.tsx` in ihrem Segment
  (`ui/skeleton/PageSkeleton.tsx`); ein Unit-Test zählt das nach. Mehrere
  Datenblöcke stehen je hinter einem `<Suspense>`.
- **Nichts springt.** Navigation, die nur den Zustand derselben Seite ändert,
  läuft mit `scroll: false`.
- **Es ist immer nur eines offen.** Escape, Klick daneben und Scrollen schliessen.
- **Der Fokus geht dorthin, wo es weitergeht.** Nach einem abgewiesenen Formular
  auf das erste beanstandete Feld.
- **Was getippt ist, überlebt einen Fehler** (`useFormDraft`).
- **Was arbeitet, sagt es und lässt sich nicht zweimal auslösen.**
- **Getippt wird entprellt** (300 ms).
- **Kein Zustand hängt an einem Mauszeiger.**
- **Ein leerer Zustand sagt, was los ist.**

### Eingabefelder

Jedes Feld hat eine Art aus `lib/validation/fields.ts`. Geprüft wird auf dem
Server, gemeldet am Feld, rot umrandet, Meldung darunter, Fokus auf das erste.
Formulare tragen `noValidate`.

### Ein E2E-Lauf gilt nur gegen einen frisch gestarteten Server

Playwright nimmt einen laufenden Server auf dem Port, statt neu zu bauen.
Vorher räumen:

```bash
lsof -ti:3401 | xargs kill -9   # dann erst messen
```

---

## 4. Komponenten — erst hier suchen

| Brauche ich… | Nehmen                                                 |
| ------------ | ------------------------------------------------------ |
| Knopf        | `ui/button/Button.tsx`                                 |
| Textfeld     | `form/input/InputField.tsx`, `form/input/TextArea.tsx` |
| Auswahl      | `form/SelectField.tsx` (ab zehn Einträgen mit Suche)   |
| Filter       | `common/FilterSelect.tsx`, `common/SearchInput.tsx`    |
| Modal        | `ui/modal/` + `hooks/useModal.ts`                      |
| Status-Chip  | `ui/badge/Badge.tsx`                                   |
| Menü         | `ui/dropdown/`                                         |
| Blättern     | `ui/pagination/Pagination.tsx`, `common/PerPageSelect` |
| Skelett      | `ui/skeleton/`                                         |
| Seitentitel  | `common/PageHeading.tsx`                               |
| Diagramm     | `components/charts/`                                   |
| Kachel       | `common/MetricCard.tsx`                                |

Hilfen: `useModal` · `useClickOutside` · `useQueryHref` · `useFormDraft`.
Generisch → `components/ui/`, fachlich → `components/<bereich>/`, nur an einer
Stelle gebraucht → neben die Seite.

---

## 5. Tests

Ziel ist Stabilität. **Schwerpunkt Unit-Tests, End-to-End wenige.**

| Ebene       | Womit                 | Wofür                                              |
| ----------- | --------------------- | -------------------------------------------------- |
| Unit        | `node:test`           | alles, was rechnet, entscheidet, prüft, formatiert |
| Integration | `node:test` + Test-DB | Wächter, Abfragen, Trennung der Konten             |
| End-to-End  | Playwright            | Registrieren, Anmelden, Karte anlegen, Lernrunde   |

- Unit-Tests liegen neben dem Code (`.test.ts`), Integrationstests auch
  (`.itest.ts`). Jede Integrationsdatei bekommt ihre eigene Datenbank
  (`db/testing.ts`); `truncateAll()` verweigert jede Datenbank, die keine
  Testdatenbank ist.
- **Import relativ mit `.ts`-Endung**, der `@/`-Alias geht in Tests nicht.
  Deshalb importiert alles unter `src/lib/` und `src/db/` relativ.
- E2E liegt in `tests/e2e/*.spec.ts` und läuft gegen die Test-DB.
- Was ein Test aufdeckt, wird behoben, nicht gemeldet. Ein falscher Test ist
  auch ein Fund.

---

## 6. Linting & Formatierung

`pnpm typecheck && pnpm lint && pnpm format:check && pnpm build` muss grün
sein. husky und lint-staged erzwingen Lint und Format vor dem Commit.

---

## 7. Vorgehen pro Aufgabe

Verstehen · Erkunden · Planen · Bauen (Schema → Abfrage → Aktion → UI) ·
Prüfen (typecheck, lint, build, Tests, 375/768/1440, hell und dunkel, das
Drumherum, das Verhalten aus §3, zuletzt jeder Satz) · Abschliessen.

**Grün heisst nicht fertig.** Was die Tests nie melden, findet nur, wer hinsieht.

---

## 8. Sicherheit — Mindeststandard

- **Unangemeldet erreichbar** sind nur `/anmelden`, `/anmelden/notfall`,
  `/registrieren`, die Icons und das Manifest. Alle Anmeldewege mit Rate-Limit
  je IP und gleicher Antwort.
- **`devLogin()`** legt lokal eine Sitzung ohne Nachweis an und hängt an drei
  Bedingungen gleichzeitig: `NODE_ENV` nicht `production`, `DEV_LOGIN_EMAIL`
  gesetzt, `Host: localhost`. Tests halten das fest.
- **Jede Bewertung ist ein Protokolleintrag, nur angefügt.** Ein Auslöser in der
  Datenbank weist `UPDATE` und `DELETE` ab; einzig das Löschen des eigenen
  Kontos darf es, in einer Transaktion.
- **Schreibende Anfragen nur von der eigenen Herkunft** (`lib/http/originCheck.ts`).
- **Kopfzeilen auf jeder Antwort** (`lib/http/securityHeaders.ts`, im Proxy):
  `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`, `Referrer-Policy:
no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `frame-ancestors 'none'`. Dazu `robots` im Layout, keine `sitemap.xml`, kein
  `Disallow: /`.
- Secrets nur aus der Umgebung, nie im Repo, nie im Client-Bündel, nie auf dem
  Bildschirm.
- **Kein fremder Dienst**, ausser beim Erfassen: Whisper, Claude Haiku und
  LanguageTool (`ENTSCHEIDE.md`). Die Sprachausgabe ist die des Browsers.

---

## 9. Stack & Betrieb

Next.js 16 · TypeScript strict · Tailwind v4 · Drizzle · Postgres 16 · pnpm ·
@simplewebauthn · ts-fsrs · ApexCharts · zod.

```bash
docker compose up -d postgres postgres-test
pnpm db:migrate
pnpm dev:konto du@beispiel.ch "Name"   # Konto für den lokalen Kurzweg
pnpm dev:seed du@beispiel.ch           # zwei französische Decks
pnpm dev                               # http://localhost:3400

pnpm typecheck  pnpm lint  pnpm format
pnpm test:unit  pnpm test:integration  pnpm test:e2e
pnpm db:generate  pnpm db:migrate  pnpm db:studio
```

Ports: App **3400**, E2E **3401**, Entwicklungs-DB **5440**, Test-DB **5441**
(ohne Volume). Das Cockpit belegt 3000, 5433 und 5434.

### Lokal hereinkommen

Ein Passkey gilt nur auf dem Namen, auf dem er angelegt wurde. Lokal gibt es
deshalb den Kurzweg: Konto mit `pnpm dev:konto` anlegen,
`DEV_LOGIN_EMAIL=…` in `.env.local`, dann steht auf `/anmelden` „Lokal anmelden
als …".

---

## 10. Anmeldung — Passkey, kein Passwort

- **Passkey ist der Hauptlogin.** Er ist selbst schon zwei Faktoren und nicht
  abfischbar.
- **Registrieren**: E-Mail und Name, dann Passkey anlegen, dann drin. Ein Konto
  entsteht erst, wenn der Passkey liegt.
- **Notfallweg**: TOTP aus einer Code-App oder einer von zehn Ersatzcodes,
  eingerichtet unter `/konto`. Ein Code gilt einmal.
- **Sitzung** gleitend 90 Tage, höchstens ein Jahr. Cookie `httpOnly`,
  `sameSite=lax`, unter https `__Host-`.
- **Sperre**: fünf Fehlversuche je Konto in 15 Minuten sperren 15 Minuten; 30
  Versuche je IP.
- **Frischer Faktor**, höchstens 15 Minuten alt: Passkey hinzufügen oder
  entfernen, Notfallweg einrichten, Ersatzcodes erzeugen, Konto löschen.

---

## 11. Verzeichnisstruktur

```
src/
  app/
    (auth)/         Anmelden, Registrieren
    (app)/          alles hinter der Anmeldung, in der Shell
    api/            Dublettenprüfung, Export
  components/
    ui/ form/ common/ charts/   Bausteine
    shell/          Kopfzeile, Leiste unten, Serie, Sprachauswahl, Benutzermenü
    <bereich>/      fachliche Komponenten
  lib/
    auth/ actions/ http/ validation/ queries/
    learning/       FSRS, Warteschlange, Intervalle — reine Funktionen
    <bereich>/      Fachlogik
  db/
    schema/         eine Datei je Bereich
  hooks/  context/  icons/
scripts/  tests/e2e/
```

---

## 12. Mehrere Sitzungen

- **`git add -A`, `git add .` und `git commit -a` sind verboten.** Immer
  ausdrückliche Pfade.
- `git stash` fasst nur an, was einem selbst gehört.
- Integrations- und E2E-Tests laufen unter einem Schloss
  (`scripts/with-lock.mts`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
