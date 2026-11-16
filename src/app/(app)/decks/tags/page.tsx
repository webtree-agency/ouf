import type { Metadata } from "next";

import PageHeading from "@/components/common/PageHeading";
import NewTagButton from "@/components/tags/NewTagButton";
import TagList from "@/components/tags/TagList";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { listTags } from "@/lib/queries/tags";

export const metadata: Metadata = { title: "Tags" };

export default async function TagsPage() {
  const { session, language } = await requireLanguage();
  const tags = await listTags(session.userId, language.id);

  return (
    <>
      <PageHeading
        title="Tags"
        action={
          tags.length > 0 ? <NewTagButton variant="outline" /> : undefined
        }
      />
      <TagList tags={tags} languageName={language.name} />
    </>
  );
}
