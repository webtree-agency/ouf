/**
 * CSV und TSV lesen und schreiben, ohne Paket. Felder in Anführungszeichen
 * dürfen Trennzeichen, Zeilenumbrüche und verdoppelte Anführungszeichen
 * enthalten (RFC 4180).
 */
export type Delimiter = "," | ";" | "\t";

export function detectDelimiter(text: string): Delimiter {
  const first =
    text.split(/\r?\n/).find((line) => line.trim() && !line.startsWith("#")) ??
    "";
  if (first.includes("\t")) return "\t";
  return count(first, ";") > count(first, ",") ? ";" : ",";
}

function count(text: string, char: string): number {
  return text.split(char).length - 1;
}

export function parseDelimited(
  input: string,
  delimiter: Delimiter,
): string[][] {
  const text = input.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  // Leere Zeilen und Ankis Kopfzeilen („#separator:tab") tragen nichts.
  return rows.filter(
    (cells) => cells.some((cell) => cell.trim()) && !cells[0].startsWith("#"),
  );
}

/**
 * Ein Feld, das mit `=`, `+` oder `@` beginnt, liest eine Tabellenkalkulation
 * als Formel. Ein Hochkomma davor hält es für Text. Das Minus bleibt, sonst
 * würde aus dem Tag „-er" etwas anderes.
 */
function guard(value: string): string {
  return /^[=+@]/.test(value) ? `'${value}` : value;
}

function quote(value: string, delimiter: Delimiter): string {
  const safe = guard(value);
  return safe.includes(delimiter) || /["\r\n]/.test(safe)
    ? `"${safe.replace(/"/g, '""')}"`
    : safe;
}

export function serializeDelimited(
  rows: readonly (readonly string[])[],
  delimiter: Delimiter,
): string {
  return (
    rows
      .map((row) => row.map((cell) => quote(cell, delimiter)).join(delimiter))
      .join("\r\n") + "\r\n"
  );
}
