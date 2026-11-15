import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  // `danger` für das, was sich nicht rückgängig machen lässt — Löschen sieht
  // nicht aus wie Speichern. `warning` für eine Entscheidung, die auffallen
  // soll, ohne zu drohen: das Ablehnen eines Angebots (Noah, 15.09.2026).
  variant?: "primary" | "outline" | "danger" | "warning";
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
  // Ohne Angabe verhält sich ein <button> in einem Formular wie „absenden" —
  // ein Abbrechen-Knopf daneben würde es sonst ebenfalls abschicken.
  type?: "button" | "submit";
  /** Führt der Knopf woandershin, ist er ein Link — und muss auch einer sein. */
  href?: string;
  /**
   * Öffnet den Link in einem neuen Tab. **Nur für Ziele ausserhalb des
   * Cockpits** — die Website des Kunden etwa: Wer sie ansieht, will danach
   * dorthin zurück, wo er war. Innerhalb bleibt der Router zuständig.
   *
   * `rel="noreferrer"` kommt mit, nicht als Wahl: Ohne das trüge der fremde
   * Server unsere Adresse im `Referer`, und die trägt bei uns Token (§8).
   */
  newTab?: boolean;
  /** Ein Download: ein schlichtes `<a>`, kein Link des Routers, der vorlädt. */
  download?: boolean;
  /**
   * Der Name für die Vorlesehilfe, wo die Beschriftung allein nicht reicht —
   * fünf Knöpfe „Durchgeführt" untereinander sind vorgelesen fünfmal dasselbe.
   *
   * **Als eigene Eigenschaft, nicht als `aria-label` von aussen:** JSX lässt
   * Attribute mit Bindestrich ungeprüft durch, eine Komponente ohne dieses Feld
   * verschluckt sie also lautlos — und `typecheck` bleibt grün (13.08.2026).
   */
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "submit",
  href,
  newTab = false,
  download = false,
  ariaLabel,
}) => {
  // **Beide Grössen sind 44 px hoch** (`h-11`), so hoch wie jedes Eingabefeld
  // (Jann, 20.09.2026). Mit `py-3.5` stand ein grüner Knopf neben einem Feld
  // vier Pixel höher als dieses, und neben einem `sm`-Knopf ebenso — die
  // Grösse unterscheidet nur noch den Abstand nach links und rechts.
  const sizeClasses = {
    sm: "h-11 px-4 text-sm",
    md: "h-11 px-5 text-sm",
  };

  // **Ein gesperrter Knopf bleibt farbig** (Noah, 07.09.2026). Ausgeblasst
  // sah er aus wie ausgeschaltet, und auf der Landingpage ist das der erste
  // Eindruck des Formulars. Was fehlt, sagt der Text daneben — beim Arbeiten
  // der Knopf selbst („Wird gespeichert …"). Der Zeiger bleibt das Signal.
  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-600 text-white shadow-theme-xs hover:bg-brand-700 dark:bg-brand-300 dark:text-gray-900 dark:hover:bg-brand-200",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
    danger: "bg-error-500 text-white shadow-theme-xs hover:bg-error-600",
    warning: "bg-warning-500 text-white shadow-theme-xs hover:bg-warning-600",
  };

  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition ${className} ${
    sizeClasses[size]
  } ${variantClasses[variant]} ${disabled ? "cursor-not-allowed" : ""}`;

  const inhalt = (
    <>
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </>
  );

  if (href && download) {
    return (
      <a href={href} download className={classes} aria-label={ariaLabel}>
        {inhalt}
      </a>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {inhalt}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {inhalt}
    </button>
  );
};

export default Button;
