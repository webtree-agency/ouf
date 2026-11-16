/**
 * Erzeugt Favicon, Apple-Icon und Manifest-Icons aus dem Zeichen in
 * `components/brand/logoPaths.ts`. Gerendert wird mit dem Chromium von
 * Playwright, das ohnehin für die E2E-Tests da ist; ein Bildpaket braucht es so
 * nicht.
 *
 *     pnpm icons
 */
import { writeFileSync } from "node:fs";

import { chromium } from "@playwright/test";

import { appIconSvg } from "../src/components/brand/logoPaths.ts";

const browser = await chromium.launch();
const page = await browser.newPage();

async function png(svg: string, size: number): Promise<Buffer> {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`,
  );
  return page.locator("svg").screenshot({ omitBackground: true, type: "png" });
}

// Ein ICO darf PNG-Daten enthalten; der Kopf ist 6 Byte, je Bild 16 Byte.
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0);
    entry.writeUInt8(size % 256, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// Ohne Grund, überall dasselbe Zeichen. iOS legt Durchsichtiges auf Schwarz.
const mark = appIconSvg();

writeFileSync("src/app/icon.svg", mark);
writeFileSync(
  "src/app/favicon.ico",
  ico([
    // Nacheinander: alle Grössen teilen sich dieselbe Seite.
    { size: 16, data: await png(mark, 16) },
    { size: 32, data: await png(mark, 32) },
    { size: 48, data: await png(mark, 48) },
  ]),
);
writeFileSync("src/app/apple-icon.png", await png(mark, 180));
writeFileSync("public/icons/icon-192.png", await png(mark, 192));
writeFileSync("public/icons/icon-512.png", await png(mark, 512));

await browser.close();
console.log("Icons geschrieben.");
