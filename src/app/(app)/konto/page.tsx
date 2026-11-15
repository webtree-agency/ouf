import type { Metadata } from "next";

import AccountDevices from "@/components/account/AccountDevices";
import AccountEmergency from "@/components/account/AccountEmergency";
import AccountName from "@/components/account/AccountName";
import AccountPasskeys from "@/components/account/AccountPasskeys";
import DeleteAccount from "@/components/account/DeleteAccount";
import PageHeading from "@/components/common/PageHeading";
import { hasConfirmedTotp } from "@/lib/auth/factors";
import { sessionOrLogin } from "@/lib/auth/pageAccess";
import {
  countUnusedRecoveryCodes,
  listPasskeys,
  listSessions,
} from "@/lib/queries/credentials";

export const metadata: Metadata = { title: "Konto" };

export default async function AccountPage() {
  const session = await sessionOrLogin();
  const [passkeys, devices, totpConfirmed, recoveryCodesLeft] =
    await Promise.all([
      listPasskeys(session.userId),
      listSessions(session.userId),
      hasConfirmedTotp(session.userId),
      countUnusedRecoveryCodes(session.userId),
    ]);

  return (
    <>
      <PageHeading title="Konto" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <AccountName name={session.name} email={session.email} />
          <AccountPasskeys passkeys={passkeys} />
          <AccountDevices
            devices={devices}
            currentSessionId={session.sessionId}
          />
        </div>
        <div className="space-y-6">
          <AccountEmergency
            totpConfirmed={totpConfirmed}
            recoveryCodesLeft={recoveryCodesLeft}
          />
          <DeleteAccount email={session.email} />
        </div>
      </div>
    </>
  );
}
