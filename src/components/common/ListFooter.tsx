import Pagination from "@/components/ui/pagination/Pagination";

/**
 * Der Fuss jeder Liste, wie im Template: links, was man gerade sieht, rechts
 * das Blättern. Die Anzahl je Seite steht oben im Kopf derselben Karte.
 */
export default function ListFooter({
  summary,
  page,
  pageCount,
  param,
}: {
  summary: string;
  page: number;
  pageCount: number;
  /** Nur wo zwei Listen auf einer Seite stehen — sonst teilen sie sich `seite`. */
  param?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
        {summary}
      </p>
      <Pagination page={page} pageCount={pageCount} param={param} />
    </div>
  );
}
