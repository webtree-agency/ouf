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

## Block 2

- **Das Konto entsteht erst, wenn der Passkey liegt.** Adresse und Name stehen
  bis dahin an der Challenge (fünf Minuten, einmalig). Verworfen: das Konto
  vorher anlegen; ein Abbruch liesse ein Konto ohne Zugang zurück, das die
  Adresse sperrt.
- **Die Registrierung sagt, wenn eine Adresse vergeben ist.** Ohne Mail an die
  Adresse gibt es keinen Weg, das zu verbergen, ohne dass sich jemand mit
  vergebener Adresse im Kreis dreht. Gegen das Durchprobieren steht das
  Rate-Limit je IP. Verworfen: die gleiche Antwort wie beim Anmelden; sie
  verlangte eine Bestätigungsmail und damit einen fremden Dienst.
- **Keine gegenseitige Wiederherstellung.** Im Cockpit schalten sich zwei
  Admins gegenseitig frei. Hier gibt es niemanden; der Notfallweg sind Code-App
  und Ersatzcodes. Wer beides verliert, legt ein neues Konto an.
- **Der lokale Kurzweg bestätigt auch den frischen Faktor** (`reconfirmLocally`),
  unter denselben drei Bedingungen. Sonst liesse sich lokal nichts prüfen, was
  einen Passkey verlangt.
- **`qrcode-generator` für den QR-Code der Code-App**, aus dem Cockpit
  übernommen, gleiche Version. Ohne ihn müsste man den Schlüssel abtippen.
- **Die Sperre meldet sich im Logger**, nicht als Meldung an Admins; ouf. hat
  keine.

## Block 3

- **Sprachen aus einer festen Liste**, Französisch mit Genus, die übrigen fünf
  nur mit Sprechsprache. Der Name steht im Code, in der Datenbank nur die
  Kennung. Verworfen: freier Name samt Sprechsprache; das ist ein Formular mit
  zwei Feldern für einen Fall, der heute nicht ansteht.
- **Eine Rückwärtskarte ist ein zweiter Lernstand derselben Karte**, keine
  zweite Karte. Abwählen lässt den Stand liegen, er kommt nur nicht mehr dran;
  wer sie wieder anwählt, macht dort weiter. Verworfen: den Stand löschen; das
  nähme der Statistik die Geschichte.
- **Das Protokoll hängt ohne Fremdschlüssel an Karte und Deck.** Wer eine Karte
  löscht, löscht ihre Geschichte nicht mit, und das Protokoll muss nie geändert
  werden. Nur am Konto hängt es fest, damit Konto löschen alles mitnimmt.
- **Dubletten werden gemeldet, nicht verboten.** „la tour" (der Turm) und „le
  tour" (die Runde) teilen sich nichts, „la mémoire" kann zweimal mit anderer
  Rückseite gewollt sein. Gesucht wird über die normierte Vorderseite in der
  ganzen Sprache, Akzente zählen mit.
- **Das Genus folgt dem Artikel, bis man es selbst setzt.** „la …" und „une …"
  heisst weiblich, „le …" und „un …" männlich; bei „l'…" und „les …" bleibt es
  offen.
- **Schnellerfassung ohne Weiterleitung.** Die Aktion gibt Erfolg zurück und
  erneuert die Ansicht; das Formular baut sich mit neuem `key` auf, der Fokus
  steht wieder vorne. Verworfen: `redirect()` auf dieselbe Seite, danach käme die
  Antwort nicht mehr beim Formular an, und der Fokus ginge verloren.
- **Bearbeiten führt in die Liste zurück, aus der man kam** (`?zurueck=`),
  geprüft auf `/karten…`.

## Block 4

- **Erst Wiederholungen, dann neue Karten**, statt sie zu mischen. Fällige
  Lernschritte gehen allem vor; am Ende kommt, was in den nächsten 20 Minuten
  fällig wird (wie Anki). Verworfen: neue Karten zwischen die Wiederholungen
  streuen; das braucht einen Zähler je Runde und bringt beim Lernen nichts,
  was man merkt.
- **Ein Aufruf je Bewertung**: Die Aktion bewertet und gibt die nächste Karte
  samt Intervallen zurück. Die Seite wird dabei nicht neu gerechnet; Übersicht
  und Statistik rechnen bei jedem Aufruf frisch.
- **Ein Doppelklick bewertet nicht zweimal.** Die Bewertung trägt den Stand
  (`reps`), mit dem die Karte gezeigt wurde; passt er nicht mehr, zählt sie
  nicht.
- **Z nimmt zurück, was heute in der aktiven Sprache bewertet wurde**, eine
  Bewertung nach der anderen. Verworfen: Rückgängig über Tage; dann stimmten
  Tagesgrenzen und Tageslimit von gestern nicht mehr.
- **Intervalle mit Dezimalpunkt** („1.5 Monate"), wie `de-CH` es schreibt.
- **Neue Karten zählen je Deck gegen das Limit**, eingeführt heisst: heute zum
  ersten Mal bewertet und nicht zurückgenommen. Eine Rückwärtskarte ist ein
  eigener Lernstand und zählt einzeln.

## Block 5

- **Vier Kacheln, je mit einem Vergleich in Worten** („morgen 6", „gestern 13",
  „von 47 neuen", „30 Tage, davor 88 %"). Verworfen: farbige Pfeile mit
  Prozent; bei „fällig" ist mehr weder gut noch schlecht, und ein rotes Minus
  neben „gelernt" wäre Gamification von hinten.
- **Trefferquote heisst: Wiederholungen ohne „Nochmal"**, nur Karten, die
  schon in der Wiederholung waren. Lernschritte zählen nicht mit, dort ist ein
  Fehler gewollt.
- **Prognose ohne neue Karten**: Wie viele neue kommen, steht im Tageslimit.
- **Achsen ausgedünnt** (bei 30 Tagen jeder Montag, bei 14 jeder zweite Tag).
  Die genauen Zahlen stehen daneben.
- **`pnpm dev:seed --verlauf`** spielt 30 Tage Lernen über die echte
  Lernlogik ein, damit die Statistik lokal etwas zeigt. Nicht in den
  Migrationen.

## Block 6

- **Installierbar über Manifest und Icons, ohne Service Worker.** Chrome und
  Edge bieten die Installation ohne ihn an, iOS braucht ihn für „Zum
  Home-Bildschirm" nicht. Verworfen: ein Service Worker für Offline; ouf.
  braucht die Datenbank, offline gäbe es nur eine Fehlerseite in schön.
- **`apple-mobile-web-app-capable` steht von Hand im Layout.** Next 16 schreibt
  für `appleWebApp.capable` nur noch `mobile-web-app-capable`.
- **CSV und TSV ohne Paket**, Lesen und Schreiben nach RFC 4180 in
  `lib/transfer/delimited.ts`. Kopfzeile auf Deutsch oder Englisch, ohne
  Kopfzeile gilt Ankis Textexport (Vorderseite, Rückseite, …); Ankis HTML wird
  zu Text. Der Export trägt ein BOM, sonst zeigt Excel keine Akzente.
- **Formeln werden beim Export entschärft**, nur `=`, `+` und `@` am Anfang.
  Das Minus bleibt, sonst würde aus dem Tag „-er" etwas anderes.
- **Import in einer Transaktion, Dubletten übersprungen.** Eine Spalte „deck"
  verteilt auf Decks dieses Namens und legt fehlende an; sonst geht alles ins
  gewählte Deck. Höchstens 2 MB und 5000 Zeilen.
- **Kein Import von `.apkg`.** Dafür bräuchte es ein ZIP- und ein
  SQLite-Paket (sql.js mit WebAssembly), und beides ist nicht unvermeidbar:
  Anki exportiert „Notizen als Text", und das liest ouf. ein.

## Block 7

- **Filter am Handy zweispaltig**, die Suche über die ganze Breite. Untereinander
  schob die Filterkarte die Liste aus dem ersten Bildschirm.
- **404 und Fehlerseite im Stil von ouf.**, kurz, mit zwei Wegen zurück.
- **Ungenutzte Bausteine gelöscht** (`TextArea`, `change`, `percent`); was hier
  liegt, läuft auch.

## Nach dem ersten Ansehen (16.11.2026)

Jann wollte weg vom Cockpit: weniger Verwaltung, mehr App, wie die Vorlage mit
„Salut" und Serie.

- **Knöpfe auf Hell in Tinte (`gray-800`) statt `brand-600`.** Das Pastell
  bleibt Fläche („Heute", aktive Navigation, Symbole, Linie unter Links).
  Verworfen: ein dunkleres Blau für Knöpfe; jedes Blau mit genug Kontrast ist
  das mittlere Blau, das nicht gefiel.
- **Keine Seitenleiste mehr.** Kopfzeile mit Navigation ab `md`, am Handy eine
  Leiste unten mit fünf Zielen. Auf `/lernen` fehlt sie, dort liegen die
  Bewertungsknöpfe. Verworfen: die Seitenleiste nur am Laptop behalten; zwei
  Navigationen je nach Breite zu pflegen lohnt sich bei fünf Zielen nicht.
- **Serie in der Kopfzeile, gegen die frühere Regel „keine Serien".** Tage in
  Folge mit mindestens einer Bewertung, über alle Sprachen, zurückgenommene
  zählen nicht. Wer heute noch nicht gelernt hat, behält die Serie bis
  Mitternacht. Verworfen: Serie je Sprache; wer zwei Sprachen lernt, lernt an
  einem Tag nicht zwingend beide.
- **Übersicht ohne Kacheln.** Begrüssung, „Heute" mit der Zahl und dem Knopf,
  darunter die Decks. Die Kacheln stehen weiter unter `/statistik`.
- **Logo dicker** (Strich 10 statt 6.5), Icons neu erzeugt.
- **Zwei Icons dazu** (`flame.svg`, `chevron-right.svg`) im Strich des
  Cockpit-Satzes; der Satz hatte keine Flamme und nur den Pfeil nach links.

## Ausliefern (16.11.2026)

- **Registrieren nur mit Adresse aus `SIGNUP_EMAILS`**, leer ist zu. Der Link
  „Konto anlegen“ ist weg; wer eingeladen ist, bekommt `/registrieren`
  geschickt. Verworfen: ein Einladungslink mit Token; das braucht eine Tabelle
  und eine Seite, und für eine Handvoll Konten reicht die Liste in Dokploy.
- **`ouf.webtree.ch`, Compose mit Postgres in Dokploy**, gebaut wie das Cockpit
  (Dockerfile, `docker-compose.dokploy.yml`). Die Migrationen spielt
  `scripts/migrate.mts` beim Start ein. Backup täglich auf R2 wie jede
  Datenbank bei uns.
- **Das Repo liegt bei `webtree-agency/ouf`**, Dokploy baut über die
  GitHub-App bei jedem Push auf `main`.
- **Die IP kommt aus `cf-connecting-ip`**, ouf. liegt hinter Cloudflare. Den
  ersten Eintrag in `x-forwarded-for` kann der Browser selbst setzen.
- **App-Icon: nur das «o»,** gross und dick, blauer Verlauf, ohne Grund.
  Verworfen: «ouf.» auf dunklem Grund (zu viel Text, Jann wollte keinen
  Grund) und «o.» mit Punkt. Ohne maskierbares Icon; Android legt das Zeichen
  selbst auf eine Fläche.
- **Logo in Outfit, nur der Punkt im Verlauf** (Jann, aus sechs Vorschlägen
  mit Kanit, Outfit, Sora, Lexend und Geist). Als Pfade aus der Schriftdatei,
  nicht als geladene Schrift. Verworfen: der Pinsel (verspielt), die selbst
  gezeichneten geometrischen Buchstaben (das «u» passte nicht zum «o») und alles
  im Verlauf (unruhig).

## Animationen beim Lernen (16.11.2026)

- **Nur CSS, kein Paket**, mit `motion-safe:`. Verworfen: Framer Motion (ein
  Paket für vier Bewegungen) und die View Transitions von React (in Next 16
  noch experimentell).
- **Die Karte geht hinaus, während die Aktion läuft.** Verworfen: erst
  animieren, dann bewerten; das hätte jede Bewertung um 160 ms verzögert.
- **Die Richtung sagt etwas:** „Nochmal" nach links, alles andere nach rechts.
  Verworfen: eine Drehung der Karte beim Aufdecken; sie verzögert das Lesen der
  Antwort.

## Navigation als Pille (16.11.2026)

- **Unten schwebend, aus Glas, auf jeder Breite** (Jann). Die Links oben in der
  Kopfzeile sind weg. Verworfen: oben am Laptop, unten am Handy; zwei Orte für
  dieselben fünf Ziele.

## Webtree-Stil (16.11.2026)

- **Outfit statt Geist**, für Logo und Oberfläche dieselbe Schrift. Verworfen:
  Sora wie die Webtree-Website; neben dem Logo in Outfit wären es zwei
  geometrische Schriften mit anderer Breite.
- **Eyebrows wie `mk-tag` der Webtree-Website**, in Pastellblau statt Mint.
- **Am Laptop Sprache und Konto in der Leiste unten**, oben nur Logo und Serie.
  Am Handy bleiben sie oben: Die Leiste ist mit fünf Zielen voll.

## Bewegung überall (16.11.2026)

- **Dasselbe leise Hereinkommen wie beim Lernen auf jeder Seite** (Jann):
  Seite, Karten, Listen versetzt, Dialoge und Menüs. Nur CSS. Verworfen: eine
  Animation je Bereich; ein Muster ist ruhiger als fünf.

## Diktat und KI beim Erfassen (16.11.2026)

- **Fremde Dienste sind fürs Erfassen erlaubt** (Jann): Das Diktat des iPhones
  ist zu schlecht. Ausnahme von §8 nur hier; Lernen, Anmeldung und Daten
  bleiben ohne fremden Dienst.
- **Plan:** Mikrofon in der Schnellerfassung, Aufnahme im Browser, Abschrift
  über Whisper bei Cloudflare Workers AI (Webtree ist dort schon, freies
  Tageskontingent), dann füllt Claude über die API Vorder- und Rückseite,
  Genus und Beispielsatz vor. Gespeichert wird erst mit Enter. Verworfen: die
  Spracherkennung des Browsers, die in Chrome ohnehin an Google geht und
  Französisch und Deutsch im selben Satz schlecht trennt.
- **Claude Haiku 5.5 mit Aufwand „low“** (Jann): Ein Wort und ein Satz
  brauchen kein grösseres Modell, gut zwei Sekunden je Vorschlag. Die
  Ausgabegrenze von 2 bis 3 $ im Monat setzt Jann in der Console.
- **Beispielsatz nur auf Wunsch** (Jann): ✦ neben dem Feld, ein zweiter Klick
  schlägt einen anderen vor. Das Diktat füllt nur Vorder-, Rückseite und Genus.
  „Vorschlagen“ geht auch aus Getipptem, „Neu vorschlagen“ will etwas anderes.
- **Erst die Abschrift, dann der Vorschlag**, zwei Aufrufe statt einem: Was
  diktiert wurde, steht sofort grau in der Vorderseite, die Felder atmen, bis
  der Vorschlag da ist, und er kommt weich herein.
- **Rechtschreibung über LanguageTool** (`api.languagetool.org`), nicht über
  Claude (Jann: „überall so günstig wie möglich“): kostenlos, ohne Schlüssel,
  kennt Akzente und Genus („le maison“ → „la maison“). Geprüft wird die
  Vorderseite, wenn man 700 ms innehält. Fällt der Dienst aus, fehlt nur der
  Hinweis.
- **Kosten im Konto**: Jeder Aufruf an Claude und Whisper landet in
  `ai_usage` (Tokens, Tonlänge), gerechnet wird beim Lesen zu Listenpreisen
  (`lib/capture/pricing.ts`). Verworfen: die Abrechnung von Anthropic abfragen;
  das braucht einen Admin-Schlüssel, und die Zahl gälte für die ganze
  Organisation, nicht für ouf.
- **`Permissions-Policy: microphone=(self)`** statt `microphone=()`: Sonst
  verweigert der Browser das Mikrofon still, auch nach der Freigabe.

## Vorschläge für alle Projekte

- **`apple-mobile-web-app-capable` von Hand setzen**, wo `appleWebApp` steht.
  Next 16 schreibt das Tag nicht mehr (Brain:
  `2026-11-16-next-16-schreibt-kein-apple-mobile-web-app-capable`). Gehört in
  den Starter.
- **Der Software-Authenticator kann auch registrieren**
  (`src/lib/auth/testing.ts`, `register()`): Bescheinigung „none" als CBOR von
  Hand, ohne Paket. Damit testet ein Integrationstest den ganzen Weg vom
  Anlegen bis zum Anmelden mit echter Signaturprüfung. Im Cockpit kann nur
  `assert()`, das Anlegen ist dort ungetestet.
