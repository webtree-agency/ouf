"use client"; // Greift auf den Body zu.

import { useEffect } from "react";

// Mehrere Dialoge übereinander teilen sich eine Sperre; erst der letzte gibt frei.
let locks = 0;
let saved: { y: number; body: string; html: string } | null = null;

/**
 * **Die Seite hinter einem Dialog steht still**, auch am iPhone. Dort reicht
 * `overflow: hidden` nicht, bei offener Tastatur scrollt Safari den Body
 * trotzdem. Deshalb wird er an der aktuellen Stelle festgesetzt und beim
 * Schliessen genau dorthin zurückgestellt.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const html = document.documentElement;
    if (locks === 0) {
      saved = {
        y: window.scrollY,
        body: body.getAttribute("style") ?? "",
        html: html.style.overflow,
      };
      body.style.position = "fixed";
      body.style.top = `-${saved.y}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks > 0 || !saved) return;
      body.setAttribute("style", saved.body);
      html.style.overflow = saved.html;
      window.scrollTo(0, saved.y);
      saved = null;
    };
  }, [active]);
}
