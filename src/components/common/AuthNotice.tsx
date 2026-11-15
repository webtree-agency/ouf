const TONES = {
  error:
    "border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400",
  warning:
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400",
  success:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400",
  info: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300",
} as const;

export default function AuthNotice({
  tone,
  children,
  className = "",
}: {
  tone: keyof typeof TONES;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`text-theme-sm rounded-lg border px-4 py-3 ${TONES[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
