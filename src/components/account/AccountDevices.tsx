"use client"; // Abmelden ist eine Aktion mit Rückmeldung.

import { useTransition, useState } from "react";

import { revokeOtherDevices } from "@/app/(app)/konto/actions";
import AuthNotice from "@/components/common/AuthNotice";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { describeDevice } from "@/lib/auth/deviceLabel";
import { formatDateTime } from "@/lib/format/dateTime";

export type DeviceRow = {
  id: string;
  userAgent: string | null;
  lastSeenAt: Date;
};

export default function AccountDevices({
  devices,
  currentSessionId,
}: {
  devices: DeviceRow[];
  currentSessionId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const others = devices.filter((device) => device.id !== currentSessionId);

  function revokeOthers() {
    setError(null);
    startTransition(async () => {
      const result = await revokeOtherDevices();
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <ComponentCard
      title="Angemeldete Geräte"
      desc="Eine Sitzung endet nach 90 Tagen ohne Nutzung."
    >
      {error && <AuthNotice tone="error">{error}</AuthNotice>}

      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {devices.map((device) => (
          <li key={device.id} className="py-3 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {describeDevice(device.userAgent)}
              </p>
              {device.id === currentSessionId && (
                <Badge color="primary" size="sm">
                  Dieses Gerät
                </Badge>
              )}
            </div>
            <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
              Zuletzt aktiv {formatDateTime(device.lastSeenAt)}
            </p>
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <Button variant="outline" onClick={revokeOthers} disabled={pending}>
          {pending
            ? "Wird abgemeldet …"
            : `Alle anderen abmelden (${others.length})`}
        </Button>
      )}
    </ComponentCard>
  );
}
