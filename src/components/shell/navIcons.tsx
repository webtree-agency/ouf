import {
  BrainIcon,
  DataBaseIcon,
  GlobeIcon,
  GridIcon,
  PieChartIcon,
  StackIcon,
  TaskIcon,
  UserCircleIcon,
} from "@/icons";
import type { NavIcon } from "@/lib/navigation";

// Ein vollständiger Record: Fehlt ein Name, meldet es die Typprüfung.
export const NAV_ICONS: Record<NavIcon, React.ReactNode> = {
  uebersicht: <GridIcon />,
  lernen: <BrainIcon />,
  // Zwei Karten übereinander; der Stapel darunter ist das Deck.
  karten: <TaskIcon />,
  decks: <StackIcon />,
  statistik: <PieChartIcon />,
  daten: <DataBaseIcon />,
  sprachen: <GlobeIcon />,
  konto: <UserCircleIcon />,
};
