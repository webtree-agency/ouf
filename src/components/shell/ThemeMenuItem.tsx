"use client"; // Liest den Modus aus dem Browser und schaltet ihn um.

import Switch from "@/components/form/switch/Switch";
import { MENU_ITEM } from "@/components/shell/menuItem";
import { useTheme } from "@/context/ThemeContext";
import { MoonIcon } from "@/icons";

export default function ThemeMenuItem() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      onClick={toggleTheme}
      className={`w-full ${MENU_ITEM}`}
    >
      <span className="menu-item-icon">
        <MoonIcon />
      </span>
      <span className="flex-1 text-left">Dunkler Modus</span>
      <Switch checked={theme === "dark"} />
    </button>
  );
}
