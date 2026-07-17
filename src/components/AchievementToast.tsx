"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = {
  id: string;
  icon: string;
  title: string;
  description: string;
  reward?: number;
};

let toastListeners: ((toast: Toast) => void)[] = [];

export function triggerAchievementToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((listener) => listener({ ...toast, id }));
}

export function AchievementToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto toast-enter",
            "flex items-center gap-4 p-4 pr-6",
            "bg-gradient-to-r from-yellow-light via-white to-pink-light",
            "border-3 border-yellow rounded-2xl",
            "shadow-[0_4px_0_rgba(234,179,8,0.3),0_8px_24px_rgba(234,179,8,0.2)]",
            "min-w-[280px] max-w-[360px]"
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-yellow to-yellow-bright flex items-center justify-center text-3xl shadow-md animate-bounce">
            {toast.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-bright">
              Achievement Unlocked!
            </p>
            <p className="text-sm font-bold text-ink truncate mt-0.5">
              {toast.title}
            </p>
            <p className="text-xs text-muted truncate">
              {toast.description}
            </p>
            {toast.reward && (
              <p className="text-xs font-bold text-yellow-bright mt-1">
                +{toast.reward} coins
              </p>
            )}
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 shine" />
          </div>
        </div>
      ))}
    </div>
  );
}
