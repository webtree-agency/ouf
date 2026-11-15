import type { Metadata } from "next";
import { Suspense } from "react";

import PageHeading from "@/components/common/PageHeading";
import { CardSkeleton, TilesSkeleton } from "@/components/ui/skeleton/Skeleton";
import { requireLanguage } from "@/lib/languages/pageLanguage";

import { ForecastSection, HistorySection, TilesSection } from "./sections";

export const metadata: Metadata = { title: "Statistik" };

export default async function StatsPage() {
  const { session, language } = await requireLanguage();
  const scope = { userId: session.userId, languageId: language.id };

  return (
    <>
      <PageHeading title="Statistik" />
      <div className="space-y-6">
        <Suspense fallback={<TilesSkeleton />}>
          <TilesSection scope={scope} />
        </Suspense>
        <Suspense fallback={<CardSkeleton lines={8} />}>
          <ForecastSection scope={scope} />
        </Suspense>
        <Suspense fallback={<CardSkeleton lines={8} />}>
          <HistorySection scope={scope} />
        </Suspense>
      </div>
    </>
  );
}
