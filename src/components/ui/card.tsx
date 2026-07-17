import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "accent" | "glass";
  accent?: "violet" | "pink" | "amber" | "emerald";
  glow?: "pink" | "purple" | "blue" | "yellow" | "none";
};

export function Card({
  className,
  variant = "default",
  accent,
  glow,
  ...props
}: CardProps) {
  const glowStyles = {
    pink: "border-pink-400 shadow-[0_4px_0_rgba(236,72,153,0.3),0_0_25px_rgba(236,72,153,0.2)] hover:shadow-[0_4px_0_rgba(236,72,153,0.4),0_0_30px_rgba(236,72,153,0.3)] bg-gradient-to-br from-white to-pink-50/50",
    purple: "border-violet-400 shadow-[0_4px_0_rgba(139,92,246,0.3),0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_0_rgba(139,92,246,0.4),0_0_30px_rgba(139,92,246,0.3)] bg-gradient-to-br from-white to-violet-50/50",
    blue: "border-blue-400 shadow-[0_4px_0_rgba(59,130,246,0.3),0_0_25px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_0_rgba(59,130,246,0.4),0_0_30px_rgba(59,130,246,0.3)] bg-gradient-to-br from-white to-blue-50/50",
    yellow: "border-amber-400 shadow-[0_4px_0_rgba(245,158,11,0.3),0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_0_rgba(245,158,11,0.4),0_0_30px_rgba(245,158,11,0.3)] bg-gradient-to-br from-white to-amber-50/50",
    none: "border-zinc-200 shadow-[0_2px_0_rgba(0,0,0,0.05)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 transition-all duration-300",
        glow
          ? cn("border-3 backdrop-blur-sm", glowStyles[glow])
          : variant === "default"
          ? "bg-white border-2 border-zinc-100 shadow-[0_4px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_0_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
          : variant === "accent"
          ? "bg-white border-2 border-zinc-100 shadow-[0_4px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
          : variant === "glass"
          ? "glass border-2 border-white/30"
          : "",
        !glow && accent === "violet" && "border-l-4 border-l-violet-500",
        !glow && accent === "pink" && "border-l-4 border-l-pink-500",
        !glow && accent === "amber" && "border-l-4 border-l-amber-500",
        !glow && accent === "emerald" && "border-l-4 border-l-emerald-500",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold text-zinc-900",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-500", className)} {...props} />
  );
}
