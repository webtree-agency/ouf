# ouf. — Design

Alle Werte stehen in `src/app/globals.css`. Hier steht, woher sie kommen und
wofür sie gelten. Leitsatz: weniger ist mehr.

## Marke

| Rolle       | Wert      | Token       |
| ----------- | --------- | ----------- |
| Primär      | `#BBD3F2` | `brand-300` |
| Text        | `#182333` | `gray-800`  |
| Hintergrund | `#F8F8F5` | `canvas`    |
| Flächen     | `#FFFFFF` | `white`     |

**Schrift:** Outfit, dieselbe wie das Logo. Regular (400) für Text, Medium (500)
für Bedienelemente, SemiBold (600) nur für Überschriften und Eyebrows.
Überschriften eng gesetzt (`tracking-tight`), wie auf der Webtree-Website.

**Eyebrow** (`eyebrow` in `globals.css`): das Etikett über einem Abschnitt wie
die `mk-tag` der Webtree-Website, eckig, gross geschrieben, gesperrt,
`text-theme-xs` halbfett. Die Fläche setzt der Ort: auf Canvas `bg-brand-100`
(dunkel `brand-300/15`), auf der Pastellfläche `bg-white/70` (dunkel
`white/10`).

**Logo:** «ouf.» in Outfit SemiBold, Laufweite -3 %, als Pfade
(`components/brand/logoPaths.ts`, `BrandLogo.tsx`); die Seite lädt keine zweite
Schrift. Die Buchstaben in `gray-900`, dunkel in Weiss, nur der Punkt im blauen
Verlauf. In der Kopfzeile `h-7`, ab `md` `h-8`.

**App-Icon:** nur das «o», gross und dick, im Verlauf, ohne Grund. Favicon,
Apple-Icon und Manifest-Icons entstehen mit `pnpm icons` (`appIconSvg`).

## Skalen

**brand** ist aus `#BBD3F2` abgeleitet: Farbton fest, Helligkeit und Buntheit
in OKLCH gestuft. Das Pastell ist `brand-300`.

| Stufe | Wert      | Stufe | Wert      |
| ----- | --------- | ----- | --------- |
| 25    | `#f5fbff` | 500   | `#618fc8` |
| 50    | `#ebf6ff` | 600   | `#4270aa` |
| 100   | `#deefff` | 700   | `#31598c` |
| 200   | `#cae2ff` | 800   | `#22436c` |
| 300   | `#bbd3f2` | 900   | `#182f4b` |
| 400   | `#89b1e3` | 950   | `#0b1b2f` |

**gray** ist aus `#182333` abgeleitet, das als `gray-800` der Text ist. Nach
unten verliert die Skala fast alle Farbe: Dunkel heisst ruhig und nahezu
schwarz (`gray-950` `#080b10`, `gray-900` `#0f141c`).

**success, error, warning** sind die Werte des Cockpits.

## Kontrast (WCAG AA, 4.5:1 für Text)

Das Pastell hat auf Hell zu wenig Kontrast für Text (1.6:1 auf Weiss). Daraus
folgt:

| Wo                 | Hell                                                | Dunkel                           |
| ------------------ | --------------------------------------------------- | -------------------------------- |
| Knopf              | `bg-gray-800` Weiss · 15:1                          | `bg-brand-300` `gray-900` · 12:1 |
| Link               | `text-gray-900`, Linie `brand-300`                  | `text-brand-300` · 12:1          |
| Aktiver Menüpunkt  | `bg-brand-300/45 text-gray-900`                     | `bg-brand-300/10 text-brand-300` |
| Nebentext          | `text-gray-500` · 4.8:1 auf canvas, 5.1:1 auf Weiss | `text-gray-400` · 7.4:1          |
| Pastell als Fläche | Logo, Auswahl, Fokusring, Diagramm                  | dieselben                        |

**Nie:** Text in einem Blau auf Hell, `brand-500` bis `brand-700` irgendwo in
der Oberfläche (Jann, 16.11.2026: das mittlere Blau wirkt wie das Cockpit),
`gray-400` als Text auf Hell.

## Flächen

- Seitengrund `bg-canvas`, dunkel `bg-gray-950`.
- Karte `rounded-2xl border border-gray-200 bg-white`, dunkel
  `dark:border-gray-800 dark:bg-gray-900`.
- Kopfzeile auf `canvas`, ohne Rand, dunkel `gray-950`. Die Navigation ist
  eine schwebende Pille unten, Glas (`bg-white/70 backdrop-blur-xl`, dunkel
  `gray-900/60`), am Handy Symbol über Text, ab `md` daneben, dazu rechts Sprache und Konto.
  Oben stehen am Laptop nur Logo und Serie.
- **„Heute" ist die einzige pastellblaue Fläche** (`bg-brand-300`, dunkel
  `brand-300/10`), mit dem dunklen Knopf darin. Ein Deck ist eine weisse Zeile
  mit Symbol in `brand-100`, die ganz klickbar ist.
- Schatten nur an Überlagerungen (`shadow-theme-lg`), nicht an Karten.

## Französisch

Die Übersicht grüsst auf Französisch („Bonjour, Jann", ab 18 Uhr „Bonsoir")
und nennt das Datum französisch („lundi 16 novembre"). Sonst bleibt die
Oberfläche deutsch.

## Schriftgrössen

Dieselben wie im Cockpit (`CLAUDE.md` §3). Die Lernkarte ist der einzige Ort
für `text-title-lg` und `text-title-2xl`.

## Lernkarte

- Ein Blatt in der Mitte, weiss mit Rand, dunkel `gray-900`.
- Vorderseite gross, Rückseite darunter, durch eine Linie getrennt.
- Genus als kleines Zeichen (`m` oder `f`) neben dem Wort, grau, kein Farbcode.
- Bewertungsknöpfe: vier gleich breite, `h-14`, am Handy unten fest im
  Daumenbereich. „Gut" ist der Hauptknopf, die anderen sind Umriss-Knöpfe.
  Unter jedem Namen das nächste Intervall.

## Diagramme

ApexCharts, Serien in `brand-400` (dunkel `brand-300`) und `gray-300` als
zweite Farbe. Kein Tooltip, keine Legende: Die Zahlen stehen daneben.

## Bewegung

Kurz und leise, alles in `globals.css` (`--animate-*`, `stagger`) und im
Markup immer mit `motion-safe:`: Wer „Bewegung reduzieren" eingeschaltet hat,
sieht keine.

- Eine Seite steigt beim Öffnen 8 px auf (`rise`, 260 ms, `(app)/template.tsx`),
  beim Filtern über die Adresse nicht.
- Jede Karte (`CARD`) steigt auf, sobald ihr Inhalt geladen ist; so löst sie das
  Skelett weich ab.
- Listen und Kacheln mit `stagger`: ein Eintrag nach dem anderen, je 40 ms,
  höchstens 320 ms.
- Dialoge und Menüs poppen auf (`pop`, 160 ms), der Grund hinter dem Dialog
  blendet ein (`fade`).

Beim Lernen:

- Eine Karte kommt von unten (220 ms), die Antwort blendet beim Aufdecken ein
  (200 ms).
- Nach dem Bewerten gleitet die Karte hinaus (160 ms): bei „Nochmal" nach
  links, sonst nach rechts. Das läuft, während der Server antwortet, und kostet
  keine Wartezeit.
- Bewertungsknöpfe und „Aufdecken" geben beim Drücken nach (`active:scale-97`).
- Kein Konfetti, keine Abzeichen. Die einzige Flamme ist die Serie in der
  Kopfzeile.
