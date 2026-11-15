export default function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  /** Nur, wenn er eine Frage beantwortet, die die Seite nicht selbst beantwortet (§3). */
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap">
      <div className="min-w-0">
        <h1 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {description && (
          <p className="text-theme-sm mt-2 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
    </div>
  );
}
