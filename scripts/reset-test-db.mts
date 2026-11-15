import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { TEST_TEMPLATE_DB, testDbNameFor } from "../src/db/testing.ts";

/**
 * **Räumt die Testdatenbanken weg, die niemand mehr braucht.**
 *
 * Jede Testdatei bekommt ihre eigene Datenbank (`db/testing.ts`), benannt nach
 * ihrem Pfad, und **das ist Absicht**: Sie entsteht einmal und wird bei jedem
 * weiteren Lauf wiederverwendet, statt jedes Mal neu angelegt zu werden. Wer
 * pauschal alles wegwirft, zahlt beim nächsten Lauf die Migrationen von vorn.
 *
 * **Was sich ansammelt, sind die Waisen.** Eine umbenannte oder gelöschte
 * Testdatei lässt ihre Datenbank zurück, und niemand vermisst sie. Am
 * 07.08.2026 lagen so 58 Stück auf einem 3.8 GB grossen tmpfs und der Lauf
 * brach mit „No space left on device" ab — 517 Tests rot, ohne dass am Code
 * etwas falsch war. Am 17.08.2026 waren es 112 und 2,5 GB, und derselbe Fehler
 * kam wieder: `TRUNCATE` scheiterte, und die Meldung sagte nichts über den Grund.
 *
 * Deshalb läuft dieses Skript **vor jedem Integrationslauf** mit (`pretest`) und
 * wirft genau die weg, zu denen es keine Testdatei mehr gibt.
 *
 *     pnpm test:reset          nur die Waisen
 *     pnpm test:reset --alle   auch die der heutigen Testdateien
 *
 * Der Bestand darf jederzeit weg: Die Datenbanken entstehen beim nächsten Lauf
 * von selbst neu.
 */

/**
 * **Ab wann alles weg muss — gemessen in Bytes, nicht in Datenbanken.**
 *
 * Der Bestand liegt im Arbeitsspeicher der Docker-VM (`docker-compose.yml`,
 * `tmpfs:size=6g`), und eine grössere Obergrenze hilft nicht: Die VM hat 7.7 GB
 * und der Container hält davon schon einen Teil.
 *
 * **Die Zahl der Datenbanken ist dafür das falsche Mass.** Eine erste Fassung
 * dieses Skripts warf ab 60 Stück alles weg — bei 113 Testdateien war das
 * dauerhaft wahr, und die Wiederverwendung, die `db/testing.ts` ausdrücklich
 * verteidigt, war damit abgeschaltet. Gemessen am 18.08.2026 belegen dieselben
 * 113 Datenbanken **1'469 MB**; was am Abend zuvor mit „No space left on device"
 * abbrach, waren 2,5 GB — dieselbe Anzahl, aufgeblähter Inhalt.
 *
 * Drei Gigabyte, also die halbe Obergrenze: Darunter bleiben sie stehen und
 * werden wiederverwendet, darüber ist Wiederverwendung nicht mehr die günstigere
 * Wahl, sondern der Grund, warum nichts mehr läuft.
 */
const HOECHSTGROESSE_MB = 3000;

const alle = process.argv.includes("--alle");

const url = process.env.DATABASE_URL_TEST;
if (!url) {
  console.error(
    "DATABASE_URL_TEST fehlt — Test-Datenbank starten: docker compose up -d postgres-test",
  );
  process.exit(1);
}

/** Alle `.itest.ts` unter `src/`, mit demselben absoluten Pfad, den `node --test` übergibt. */
function itestFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...itestFiles(path));
    else if (entry.endsWith(".itest.ts")) found.push(path);
  }
  return found;
}

const lebende = new Set(
  itestFiles(resolve("src")).map((file) => testDbNameFor(file)),
);

// **Die Vorlage ist keine Waise.** Sie gehört zu keiner Testdatei und trägt
// trotzdem das `t_`-Muster — ohne diese Zeile wirft der Lauf sie jedes Mal weg
// und legt sie gleich darauf neu an.
lebende.add(TEST_TEMPLATE_DB);

const admin = postgres(url, { max: 1, onnotice: () => {} });

/**
 * **Legt die Vorlage an und bringt sie auf den neuesten Stand** — die
 * Begründung samt Messwerten steht bei `TEST_TEMPLATE_DB` in `db/testing.ts`.
 *
 * Sie entsteht hier und nicht in `setupTestDb()`, weil sie **einmal je Lauf**
 * migriert werden muss und nicht 116 Mal. Und die Verbindung wird danach
 * geschlossen: Solange eine Sitzung auf der Vorlage steht, weist Postgres jede
 * Kopie ab.
 */
async function vorlageBereitstellen(basis: string): Promise<void> {
  const [vorhanden] = await admin`
    select 1 from pg_database where datname = ${TEST_TEMPLATE_DB}
  `;
  if (!vorhanden) {
    await admin.unsafe(`create database "${TEST_TEMPLATE_DB}"`);
  }

  const ziel = new URL(basis);
  ziel.pathname = `/${TEST_TEMPLATE_DB}`;
  const sql = postgres(ziel.toString(), { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(sql), { migrationsFolder: "drizzle" });
  } finally {
    await sql.end();
  }
}

try {
  const vorhanden = await admin<{ datname: string; mb: number }[]>`
    select datname, (pg_database_size(datname) / 1024 / 1024)::int as mb
    from pg_database where datname like 't\\_%'
  `;

  const belegt = vorhanden.reduce((summe, row) => summe + row.mb, 0);

  // **Läuft gerade ein zweiter Testlauf, wird nichts weggeworfen.** `drop … with
  // (force)` trennt offene Verbindungen ausdrücklich — es risse dem anderen Lauf
  // die Datenbank unter den Füssen weg, mitten im Test und mit einer Meldung,
  // die nichts über den Grund sagt. Genau das Fehlerbild, gegen das es dieses
  // Skript gibt.
  const [{ aktiv }] = await admin<{ aktiv: number }[]>`
    select count(*)::int as aktiv from pg_stat_activity
    where datname like 't\\_%' and pid <> pg_backend_pid()
  `;

  if (aktiv > 0) {
    console.log(
      `Ein Testlauf arbeitet gerade (${aktiv} Verbindungen) — nichts weggeworfen.`,
    );
  } else {
    const raeumen = alle || belegt > HOECHSTGROESSE_MB;

    const wegwerfen = raeumen
      ? vorhanden
      : vorhanden.filter(({ datname }) => !lebende.has(datname));

    for (const { datname } of wegwerfen) {
      // `force` trennt Verbindungen, die ein abgebrochener Lauf zurückgelassen
      // hat. Ein *laufender* Lauf ist oben schon ausgeschlossen.
      await admin.unsafe(`drop database if exists "${datname}" with (force)`);
    }

    if (wegwerfen.length > 0) {
      console.log(
        raeumen
          ? `${wegwerfen.length} Testdatenbanken verworfen ` +
              `(${belegt} MB über ${HOECHSTGROESSE_MB} MB — der Speicher der Docker-VM reicht sonst nicht).`
          : `${wegwerfen.length} verwaiste Testdatenbanken verworfen ` +
              `(${lebende.size} gehören zu heutigen Testdateien und bleiben).`,
      );
    }

    // **Erst nach dem Aufräumen** — `--alle` wirft die Vorlage mit weg, und ohne
    // sie fiele jede Testdatei auf das langsame Anlegen zurück.
    await vorlageBereitstellen(url);
  }
} finally {
  await admin.end();
}
