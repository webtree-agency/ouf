import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: { default: "ouf.", template: "%s · ouf." },
  applicationName: "ouf.",
  robots: { index: false, follow: false, nocache: true },
  appleWebApp: { capable: true, title: "ouf.", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // Next 16 schreibt für `appleWebApp.capable` nur `mobile-web-app-capable`;
  // ältere iPhones öffnen ohne das Apple-Tag im Browser statt als App.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#080b10" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Setzt die Dark-Klasse vor dem ersten Paint, sonst blitzt beim Laden Hell auf.
const themeScript = `(()=>{try{const m=localStorage.getItem("theme-mode")||"auto";const d=m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch{}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
