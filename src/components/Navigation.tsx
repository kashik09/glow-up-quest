"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/schedule", label: "Schedule", emoji: "📅" },
  { href: "/routine", label: "Routine", emoji: "⚡" },
  { href: "/tracker", label: "Tracker", emoji: "📊" },
  { href: "/checklist", label: "Quests", emoji: "✅" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t-2 border-purple/20 px-4 py-2 md:static md:bg-transparent md:border-0 md:py-0">
      <div className="flex items-center justify-around md:justify-end md:gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 md:flex-row md:gap-2",
                isActive
                  ? "text-purple-bright scale-110 md:scale-100"
                  : "text-muted hover:text-purple-bright hover:scale-105"
              )}
            >
              <span className="text-xl md:text-base">{item.emoji}</span>
              <span className={cn(
                "text-xs font-bold md:text-sm",
                isActive && "bg-gradient-to-r from-pink-bright to-purple-bright bg-clip-text text-transparent"
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-bright md:hidden" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
