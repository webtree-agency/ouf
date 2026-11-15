/**
 * **Ein Schloss um die Testdatenbank.**
 *
 * Die Integrationstests räumen auf, bevor sie laufen (`reset-test-db.mts`) und
 * leeren zwischen den Dateien den Bestand (`truncateAll`). Beides ist richtig —
 * solange nur ein Lauf unterwegs ist. Zwei Sitzungen gleichzeitig, und die eine
 * löscht der anderen die Zeilen unter den Füssen weg: Am 19.08.2026 kamen so
 * 567 rote Tests heraus, die einzeln alle grün waren.
 *
 * Also warten statt raten. Wer zuerst kommt, läuft; die anderen stehen an und
 * sagen es auch. Ein liegengebliebenes Schloss von einem abgestürzten Lauf
 * verfällt nach `STALE_MS` — sonst wartet der nächste Lauf für immer.
 *
 *     node --experimental-strip-types scripts/with-lock.mts <name> -- <befehl …>
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Länger als der längste Lauf, kürzer als die Geduld: der volle Lauf misst ~50 s. */
const STALE_MS = 10 * 60 * 1000;
const POLL_MS = 500;

const trenner = process.argv.indexOf("--");
const name = process.argv[2];
const befehl = trenner === -1 ? [] : process.argv.slice(trenner + 1);

if (!name || befehl.length === 0) {
  console.error("So: with-lock.mts <name> -- <befehl …>");
  process.exit(1);
}

const ordner = join(tmpdir(), "ouf-schloss");
mkdirSync(ordner, { recursive: true });
const schloss = join(ordner, `${name}.pid`);

let gemeldet = false;
while (!belegen()) {
  if (!gemeldet) {
    console.log(
      `Ein anderer Lauf hat die Testdatenbank (${halterInfo()}). Warte …`,
    );
    gemeldet = true;
  }
  await new Promise((weiter) => setTimeout(weiter, POLL_MS));
}

// Auch bei Strg-C und bei einem Fehler wieder freigeben — ein Schloss, das
// niemandem mehr gehört, hält den nächsten zehn Minuten auf.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    freigeben();
    process.exit(130);
  });
}

const lauf = spawnSync(befehl[0], befehl.slice(1), { stdio: "inherit" });
freigeben();
process.exit(lauf.status ?? 1);

function belegen(): boolean {
  try {
    writeFileSync(schloss, `${process.pid} ${Date.now()}`, { flag: "wx" });
    return true;
  } catch {
    return verfallen() ? (rmSync(schloss, { force: true }), false) : false;
  }
}

/** Ob das liegende Schloss von einem Lauf stammt, den es nicht mehr gibt. */
function verfallen(): boolean {
  const [pid, seit] = halter();
  if (!pid) return true;
  if (Date.now() - seit > STALE_MS) return true;

  try {
    process.kill(pid, 0);
    return false;
  } catch {
    // Kein Prozess mehr unter dieser Nummer.
    return true;
  }
}

function halter(): [number, number] {
  try {
    const [pid, seit] = readFileSync(schloss, "utf8").split(" ");
    return [Number(pid), Number(seit)];
  } catch {
    return [0, 0];
  }
}

function halterInfo(): string {
  const [pid, seit] = halter();
  const sekunden = Math.round((Date.now() - seit) / 1000);
  return pid ? `PID ${pid}, seit ${sekunden} s` : "unbekannt";
}

function freigeben(): void {
  const [pid] = halter();
  if (pid === process.pid) rmSync(schloss, { force: true });
}
