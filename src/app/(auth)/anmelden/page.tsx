import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DevSignIn from "@/components/auth/DevSignIn";
import PasskeySignIn from "@/components/auth/PasskeySignIn";
import { devLoginEmail } from "@/lib/auth/devLogin";
import { safeRedirectTarget } from "@/lib/auth/redirectTarget";
import { currentSession } from "@/lib/auth/serverSession";

export const metadata: Metadata = { title: "Anmelden" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string }>;
}) {
  const target = safeRedirectTarget((await searchParams).weiter);
  if (await currentSession()) redirect(target);

  const devEmail = devLoginEmail((await headers()).get("host"));

  return (
    <>
      <PasskeySignIn redirectTo={target} />
      {devEmail && <DevSignIn email={devEmail} redirectTo={target} />}
    </>
  );
}
