"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/checklist", label: "Quests", emoji: "✅" },
  { href: "/shop", label: "Shop", emoji: "🛒" },
  { href: "/schedule", label: "Plan", emoji: "📅" },
  { href: "/routine", label: "Routine", emoji: "⚡" },
  { href: "/tracker", label: "Track", emoji: "📊" },
  { href: "/data", label: "Profile", emoji: "🧬" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-100 px-2 py-2 lg:static lg:bg-transparent lg:border-0 lg:py-0">
      <div className="flex items-center justify-around lg:justify-end lg:gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 lg:flex-row lg:gap-2 lg:px-3 lg:py-2",
                isActive
                  ? "bg-violet-50 -translate-y-0.5"
                  : "hover:bg-zinc-50"
              )}
            >
              <span className="text-lg lg:text-base">
                {item.emoji}
              </span>
              <span className={cn(
                "text-[10px] font-medium lg:text-xs",
                isActive
                  ? "text-violet-600"
                  : "text-zinc-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
