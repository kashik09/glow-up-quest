import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: "pink" | "purple" | "blue" | "yellow" | "none";
};

const glowStyles: Record<NonNullable<CardProps["glow"]>, string> = {
  pink: "hover:shadow-glow border-pink/30 hover:border-pink",
  purple: "hover:shadow-glow-purple border-purple/30 hover:border-purple",
  blue: "hover:shadow-glow-blue border-blue/30 hover:border-blue",
  yellow: "hover:shadow-soft border-yellow/30 hover:border-yellow",
  none: "border-purple/20",
};

export function Card({
  className,
  glow = "purple",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 bg-white/70 backdrop-blur-md p-5 transition-all duration-300",
        glowStyles[glow],
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
        "text-lg font-bold bg-gradient-to-r from-purple-bright to-pink-bright bg-clip-text text-transparent",
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
    <p className={cn("text-sm text-muted leading-relaxed", className)} {...props} />
  );
}
