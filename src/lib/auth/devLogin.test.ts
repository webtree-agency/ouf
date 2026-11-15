import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { devLoginEmail } from "./devLogin.ts";

// `NODE_ENV` gilt der Typprüfung als schreibgeschützt — im Test wird es genau
// darum gedreht: die Regel muss auch dann halten, wenn jemand daran dreht.
const env = process.env as Record<string, string | undefined>;
const ORIGINAL = env.NODE_ENV;

afterEach(() => {
  env.NODE_ENV = ORIGINAL;
  delete env.DEV_LOGIN_EMAIL;
});

function umgebung(node: string, email?: string) {
  env.NODE_ENV = node;
  if (email) env.DEV_LOGIN_EMAIL = email;
  else delete env.DEV_LOGIN_EMAIL;
}

test("greift lokal, wenn die Variable gesetzt ist", () => {
  umgebung("development", "jann@ouf.local");

  assert.equal(devLoginEmail("localhost:3000"), "jann@ouf.local");
  assert.equal(devLoginEmail("localhost:3001"), "jann@ouf.local");
  assert.equal(devLoginEmail("127.0.0.1:3000"), "jann@ouf.local");
  assert.equal(devLoginEmail("[::1]:3000"), "jann@ouf.local");
});

test("ohne die Variable gibt es ihn nicht", () => {
  umgebung("development");

  assert.equal(devLoginEmail("localhost:3000"), null);
});

// Die Bedingung, die von aussen niemand erfüllen kann: ein Proxy reicht den
// echten Hostnamen durch, ein Aufruf an die Domain trägt nie „localhost".
test("gegen einen fremden Hostnamen greift er nie", () => {
  umgebung("development", "jann@ouf.local");

  assert.equal(devLoginEmail("app.ouf.example"), null);
  assert.equal(devLoginEmail("ouf.example"), null);
  assert.equal(devLoginEmail("localhost.ouf.example"), null);
  assert.equal(devLoginEmail("evil-localhost"), null);
  assert.equal(devLoginEmail(null), null);
  assert.equal(devLoginEmail(""), null);
});

test("im Produktivmodus bleibt er zu, egal was gesetzt ist", () => {
  umgebung("production", "jann@ouf.local");

  assert.equal(devLoginEmail("localhost:3000"), null);
  assert.equal(devLoginEmail("127.0.0.1"), null);
});
