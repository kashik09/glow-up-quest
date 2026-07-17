"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type PopupType = "xp" | "coin" | "crit" | "combo" | "level";

type Popup = {
  id: number;
  text: string;
  type: PopupType;
  x: number;
  y: number;
};

let popupId = 0;

// Global event system for popups
const listeners: ((popup: Omit<Popup, "id">) => void)[] = [];

export function triggerPopup(text: string, type: PopupType, x?: number, y?: number) {
  // Random offset for stacking effect
  const offsetX = (Math.random() - 0.5) * 15;
  const offsetY = Math.random() * 10;

  const popup = {
    text,
    type,
    x: (x ?? 50) + offsetX,
    y: (y ?? 25) + offsetY,
  };
  listeners.forEach(listener => listener(popup));
}

// Helper to trigger at element position
export function triggerPopupAtElement(text: string, type: PopupType, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
  const y = ((rect.top) / window.innerHeight) * 100;
  triggerPopup(text, type, x, y);
}

const typeStyles: Record<PopupType, string> = {
  xp: "text-purple-bright text-2xl md:text-3xl",
  coin: "text-yellow-bright text-2xl md:text-3xl",
  crit: "text-pink-bright text-3xl md:text-4xl",
  combo: "text-blue-bright text-2xl md:text-3xl",
  level: "text-4xl md:text-5xl bg-gradient-to-r from-pink-bright via-purple-bright to-blue-bright bg-clip-text text-transparent",
};

export function XPPopupContainer() {
  const [popups, setPopups] = useState<Popup[]>([]);

  const addPopup = useCallback((popup: Omit<Popup, "id">) => {
    popupId++;
    const newPopup = { ...popup, id: popupId };
    setPopups(prev => [...prev, newPopup]);

    // Remove after animation
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== newPopup.id));
    }, 1200);
  }, []);

  useEffect(() => {
    listeners.push(addPopup);
    return () => {
      const idx = listeners.indexOf(addPopup);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [addPopup]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {popups.map(popup => (
        <div
          key={popup.id}
          className={cn(
            "absolute font-black damage-number",
            typeStyles[popup.type]
          )}
          style={{
            left: `${popup.x}%`,
            top: `${popup.y}%`,
            transform: "translateX(-50%)",
          }}
        >
          {popup.text}
        </div>
      ))}
    </div>
  );
}
