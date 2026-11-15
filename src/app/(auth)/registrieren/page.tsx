import type { Metadata } from "next";
import { redirect } from "next/navigation";

import SignUp from "@/components/auth/SignUp";
import { currentSession } from "@/lib/auth/serverSession";

export const metadata: Metadata = { title: "Registrieren" };

export default async function SignUpPage() {
  if (await currentSession()) redirect("/");
  return <SignUp />;
}
