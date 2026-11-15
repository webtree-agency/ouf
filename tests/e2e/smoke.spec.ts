import { expect, test } from "@playwright/test";

test("jede Antwort trägt die Sicherheitskopfzeilen", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  expect(response.headers()["x-robots-tag"]).toBe(
    "noindex, nofollow, noarchive, nosnippet",
  );
  expect(response.headers()["x-frame-options"]).toBe("DENY");
});

test("das Manifest macht ouf. installierbar", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
    expect.arrayContaining(["192x192", "512x512"]),
  );
});
