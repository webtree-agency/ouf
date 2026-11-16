import Link from "next/link";

import ComponentCard from "@/components/common/ComponentCard";

export default function RecentCards({
  cards,
}: {
  cards: { id: string; front: string; back: string }[];
}) {
  if (cards.length === 0) return null;
  return (
    <ComponentCard title="Zuletzt erfasst">
      <ul className="stagger divide-y divide-gray-100 dark:divide-gray-800">
        {cards.map((card) => (
          <li
            key={card.id}
            className="text-theme-sm py-2.5 first:pt-0 last:pb-0"
          >
            <Link
              href={`/karten/${card.id}?zurueck=${encodeURIComponent("/karten")}`}
              className="link-underline font-medium text-gray-800 dark:text-white/90"
            >
              {card.front}
            </Link>
            <span className="text-gray-500 dark:text-gray-400">
              {" "}
              · {card.back}
            </span>
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
}
