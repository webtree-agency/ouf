import { Suspense } from "react";

import PageHeading from "@/components/common/PageHeading";
import Button from "@/components/ui/button/Button";
import {
  TableSkeleton,
  TilesSkeleton,
} from "@/components/ui/skeleton/Skeleton";
import { requireLanguage } from "@/lib/languages/pageLanguage";

import { DecksSection, TilesSection } from "./sections";

export default async function OverviewPage() {
  const { session, language } = await requireLanguage();
  const scope = { userId: session.userId, languageId: language.id };

  return (
    <>
      <PageHeading
        title="Übersicht"
        action={<Button href="/lernen">Alle lernen</Button>}
      />
      <div className="space-y-6">
        <Suspense fallback={<TilesSkeleton />}>
          <TilesSection scope={scope} />
        </Suspense>
        <Suspense fallback={<TableSkeleton rows={3} />}>
          <DecksSection scope={scope} languageName={language.name} />
        </Suspense>
      </div>
    </>
  );
}
