import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";
import { counted } from "@/lib/format/plural";
import type { TagRow } from "@/lib/queries/tags";
import NewTagButton from "./NewTagButton";
import TagActions from "./TagActions";
import TagChip from "./TagChip";

export default function TagList({
  tags,
  languageName,
}: {
  tags: TagRow[];
  languageName: string;
}) {
  if (tags.length === 0) {
    return (
      <ComponentCard>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          In {languageName} gibt es noch keinen Tag. Mit Tags lernst du später
          gezielt ein Thema, etwa alles zum Essen.
        </p>
        <NewTagButton />
      </ComponentCard>
    );
  }

  return (
    <ComponentCard>
      <ul className="stagger divide-y divide-gray-100 dark:divide-gray-800">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <TagChip tag={tag} size="md" />
              <Link
                href={`/karten?tag=${encodeURIComponent(tag.name)}`}
                className="link-underline text-theme-sm text-gray-500 dark:text-gray-400"
              >
                {counted(tag.cardCount, { one: "Karte", many: "Karten" })}
              </Link>
            </div>
            <TagActions tag={tag} cardCount={tag.cardCount} />
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
}
