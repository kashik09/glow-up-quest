import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "pink" | "purple" | "blue" | "yellow";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-pink via-purple to-blue text-ink shadow-soft hover:shadow-glow hover:-translate-y-1 active:translate-y-0 transition-all duration-200",
  ghost:
    "border-2 border-purple/30 text-ink hover:border-purple hover:bg-purple-light/50 backdrop-blur-sm",
  pink:
    "bg-gradient-to-r from-pink-light to-pink text-ink hover:shadow-glow hover:-translate-y-1 transition-all",
  purple:
    "bg-gradient-to-r from-purple-light to-purple text-ink hover:shadow-glow-purple hover:-translate-y-1 transition-all",
  blue:
    "bg-gradient-to-r from-blue-light to-blue text-ink hover:shadow-glow-blue hover:-translate-y-1 transition-all",
  yellow:
    "bg-gradient-to-r from-yellow-light to-yellow text-ink hover:shadow-soft hover:-translate-y-1 transition-all",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
