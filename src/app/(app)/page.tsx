import { Suspense } from "react";

import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton/Skeleton";
import { frenchDay, greeting } from "@/lib/format/greeting";
import { requireLanguage } from "@/lib/languages/pageLanguage";

import { TodaySection } from "./sections";

export default async function OverviewPage() {
  const { session, language } = await requireLanguage();
  const scope = { userId: session.userId, languageId: language.id };
  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-sm font-medium text-gray-900 dark:text-white/90">
          {greeting(now)}, {session.name}
        </h1>
        <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
          {frenchDay(now)}
        </p>
      </div>
      <Suspense
        fallback={
          <>
            <CardSkeleton lines={4} />
            <TableSkeleton rows={3} />
          </>
        }
      >
        <TodaySection scope={scope} />
      </Suspense>
    </div>
  );
}
