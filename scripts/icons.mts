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

// Im Browser-Tab rundet niemand: dort rundet das Icon selbst.
const transparent = appIconSvg({ rounded: true });
// iOS und Android runden selbst: also ein voller Grund bis in die Ecken.
const onCanvas = appIconSvg();
// Android schneidet maskierbare Icons im Kreis an: Zeichen kleiner.
const maskable = appIconSvg({ scale: 0.58 });

writeFileSync("src/app/icon.svg", transparent);
writeFileSync(
  "src/app/favicon.ico",
  ico([
    // Nacheinander: alle Grössen teilen sich dieselbe Seite.
    { size: 16, data: await png(transparent, 16) },
    { size: 32, data: await png(transparent, 32) },
    { size: 48, data: await png(transparent, 48) },
  ]),
);
writeFileSync("src/app/apple-icon.png", await png(onCanvas, 180));
writeFileSync("public/icons/icon-192.png", await png(onCanvas, 192));
writeFileSync("public/icons/icon-512.png", await png(onCanvas, 512));
writeFileSync("public/icons/icon-maskable-512.png", await png(maskable, 512));

await browser.close();
console.log("Icons geschrieben.");
