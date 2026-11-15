import PageHeading from "@/components/common/PageHeading";
import { requireLanguage } from "@/lib/languages/pageLanguage";

export default async function OverviewPage() {
  await requireLanguage();
  return <PageHeading title="Übersicht" />;
}
