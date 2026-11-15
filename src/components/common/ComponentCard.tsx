import { CARD } from "@/components/common/card";

interface ComponentCardProps {
  /**
   * Weglassen, wo der Seitentitel schon dasselbe sagt — dann entfällt der Kopf
   * samt Trennlinie, statt „Rechnungen" zweimal untereinander zu stellen (§3).
   */
  title?: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  /** Bedienelement rechts vom Titel — etwa, wie viel die Karte zeigt. */
  action?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  action,
}) => {
  return (
    <div className={`min-w-0 ${CARD} ${className}`}>
      {/* Card Header */}
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div>
            {title && (
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                {title}
              </h3>
            )}
            {desc && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            )}
          </div>
          {action}
        </div>
      )}

      {/* Card Body */}
      <div
        className={`p-4 sm:p-6 ${title || action ? "border-t border-gray-100 dark:border-gray-800" : ""}`}
      >
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
