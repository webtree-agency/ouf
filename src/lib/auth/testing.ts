import {
  createHash,
  createSign,
  generateKeyPairSync,
  randomBytes,
} from "node:crypto";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

// Authenticator aus Software — ohne ihn endet der Test vor der Signaturprüfung.
export type FakeAuthenticator = {
  credentialId: string;
  publicKey: string;
  assert(input: {
    challenge: string;
    origin: string;
    rpId: string;
    counter?: number;
  }): AuthenticationResponseJSON;
  register(input: {
    challenge: string;
    origin: string;
    rpId: string;
  }): RegistrationResponseJSON;
};

export function createFakeAuthenticator(): FakeAuthenticator {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "P-256",
  });
  const jwk = publicKey.export({ format: "jwk" });
  const credentialId = randomBytes(16).toString("base64url");

  return {
    credentialId,
    publicKey: coseKey(jwk.x as string, jwk.y as string).toString("base64url"),

    register({ challenge, origin, rpId }) {
      const cose = coseKey(jwk.x as string, jwk.y as string);
      const idBytes = Buffer.from(credentialId, "base64url");
      const credentialLength = Buffer.alloc(2);
      credentialLength.writeUInt16BE(idBytes.length);
      const authData = Buffer.concat([
        createHash("sha256").update(rpId).digest(),
        // UP | UV | AT: Anwesenheit, Nutzerprüfung, angehängte Schlüsseldaten.
        Buffer.from([0x45]),
        counterBytes(0),
        Buffer.alloc(16),
        credentialLength,
        idBytes,
        cose,
      ]);
      const clientDataJSON = Buffer.from(
        JSON.stringify({
          type: "webauthn.create",
          challenge,
          origin,
          crossOrigin: false,
        }),
      );

      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        clientExtensionResults: {},
        response: {
          clientDataJSON: clientDataJSON.toString("base64url"),
          attestationObject: noneAttestation(authData).toString("base64url"),
          transports: ["internal"],
        },
      };
    },

    assert({ challenge, origin, rpId, counter = 1 }) {
      const authenticatorData = Buffer.concat([
        createHash("sha256").update(rpId).digest(),
        // UP | UV: Anwesenheit und Nutzerprüfung, wie es „userVerification: required" verlangt.
        Buffer.from([0x05]),
        counterBytes(counter),
      ]);

      const clientDataJSON = Buffer.from(
        JSON.stringify({
          type: "webauthn.get",
          challenge,
          origin,
          crossOrigin: false,
        }),
      );

      const signer = createSign("sha256");
      signer.update(
        Buffer.concat([
          authenticatorData,
          createHash("sha256").update(clientDataJSON).digest(),
        ]),
      );

      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        clientExtensionResults: {},
        response: {
          clientDataJSON: clientDataJSON.toString("base64url"),
          authenticatorData: authenticatorData.toString("base64url"),
          signature: signer.sign(privateKey).toString("base64url"),
        },
      };
    },
  };
}

// COSE_Key für ES256, von Hand kodiert — für fünf feste Paare lohnt kein CBOR-Paket.
function coseKey(x: string, y: string): Buffer {
  return Buffer.concat([
    Buffer.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21, 0x58, 0x20]),
    Buffer.from(x, "base64url"),
    Buffer.from([0x22, 0x58, 0x20]),
    Buffer.from(y, "base64url"),
  ]);
}

// {fmt: "none", attStmt: {}, authData: <bytes>} als CBOR, von Hand.
function noneAttestation(authData: Buffer): Buffer {
  const text = (value: string) =>
    Buffer.concat([Buffer.from([0x60 + value.length]), Buffer.from(value)]);
  const length = Buffer.alloc(2);
  length.writeUInt16BE(authData.length);
  return Buffer.concat([
    Buffer.from([0xa3]),
    text("fmt"),
    text("none"),
    text("attStmt"),
    Buffer.from([0xa0]),
    text("authData"),
    Buffer.from([0x59]),
    length,
    authData,
  ]);
}

function counterBytes(counter: number): Buffer {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(counter);
  return bytes;
}
