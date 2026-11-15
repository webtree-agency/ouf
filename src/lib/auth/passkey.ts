import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";

// Die einzige Datei, die @simplewebauthn kennt; hier endet die fremde Bibliothek.
export type StoredPasskey = {
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[] | null;
};

export function registrationOptions(input: {
  userId: string;
  email: string;
  name: string;
  existing: readonly { credentialId: string }[];
}): Promise<PublicKeyCredentialCreationOptionsJSON> {
  return generateRegistrationOptions({
    rpName: "ouf.",
    rpID: relyingPartyId(),
    userID: userHandle(input.userId),
    userName: input.email,
    userDisplayName: input.name,
    // Keine Herstellerbescheinigung: sie würde nur festlegen, welche Geräte erlaubt sind.
    attestationType: "none",
    excludeCredentials: input.existing.map((passkey) => ({
      id: passkey.credentialId,
    })),
    authenticatorSelection: {
      // Auffindbar, damit die Anmeldung ohne Eingabe der Adresse geht.
      residentKey: "required",
      // Touch ID, Face ID oder Windows Hello: der zweite Faktor steckt hier drin.
      userVerification: "required",
    },
  });
}

export async function verifyRegistration(input: {
  response: RegistrationResponseJSON;
  expectedChallenge: string;
}): Promise<StoredPasskey | null> {
  const result = await rejected(() =>
    verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: input.expectedChallenge,
      expectedOrigin: expectedOrigin(),
      expectedRPID: relyingPartyId(),
      requireUserVerification: true,
    }),
  );

  if (!result?.verified) return null;

  const credential = result.registrationInfo.credential;
  return {
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports ?? null,
  };
}

export async function loginOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const options = await generateAuthenticationOptions({
    rpID: relyingPartyId(),
    // Ohne allowCredentials wählt der Browser selbst: der Ein-Sekunden-Weg.
    userVerification: "required",
  });

  // Chrome unter macOS bot sonst bei iCloud-Passkeys den Weg übers Handy an und
  // hielt sich nicht an den Timeout (Cockpit). Wer `hints` nicht kennt, übergeht es.
  return { ...options, hints: ["client-device"] };
}

export async function verifyLogin(input: {
  response: AuthenticationResponseJSON;
  expectedChallenge: string;
  passkey: StoredPasskey;
}): Promise<{ newCounter: number } | null> {
  const result = await rejected(() =>
    verifyAuthenticationResponse({
      response: input.response,
      expectedChallenge: input.expectedChallenge,
      expectedOrigin: expectedOrigin(),
      expectedRPID: relyingPartyId(),
      credential: {
        id: input.passkey.credentialId,
        publicKey: Uint8Array.from(
          Buffer.from(input.passkey.publicKey, "base64url"),
        ),
        counter: input.passkey.counter,
        transports:
          (input.passkey.transports as AuthenticatorTransportFuture[] | null) ??
          undefined,
      },
      requireUserVerification: true,
    }),
  );

  if (!result?.verified) return null;
  return { newCounter: result.authenticationInfo.newCounter };
}

/** Die Challenge steht in der Antwort; sicher, weil sie danach verbraucht wird. */
export function challengeFrom(
  response: RegistrationResponseJSON | AuthenticationResponseJSON,
): string {
  try {
    const clientData = JSON.parse(
      Buffer.from(response.response.clientDataJSON, "base64url").toString(
        "utf8",
      ),
    ) as { challenge?: unknown };
    return typeof clientData.challenge === "string" ? clientData.challenge : "";
  } catch {
    return "";
  }
}

// Falsche Herkunft ist kein Ausnahmefall, sondern ein gescheiterter Versuch.
async function rejected<T>(verify: () => Promise<T>): Promise<T | null> {
  try {
    return await verify();
  } catch {
    return null;
  }
}

// Passkeys sind an den Namen gebunden: falscher Wert, und niemand kommt mehr hinein.
export function relyingPartyId(): string {
  return new URL(expectedOrigin()).hostname;
}

export function expectedOrigin(): string {
  const url = process.env.APP_URL;
  if (!url) throw new Error("APP_URL ist nicht gesetzt");
  return new URL(url).origin;
}

function userHandle(userId: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(Buffer.from(userId.replace(/-/g, ""), "hex"));
}
