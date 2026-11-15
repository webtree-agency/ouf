import type { Metadata } from "next";
import { redirect } from "next/navigation";

import EmergencySignIn from "@/components/auth/EmergencySignIn";
import { safeRedirectTarget } from "@/lib/auth/redirectTarget";
import { currentSession } from "@/lib/auth/serverSession";

export const metadata: Metadata = { title: "Anders anmelden" };

export default async function EmergencyPage({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string }>;
}) {
  const target = safeRedirectTarget((await searchParams).weiter);
  if (await currentSession()) redirect(target);

  return <EmergencySignIn redirectTo={target} />;
}
