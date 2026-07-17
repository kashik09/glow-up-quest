import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "pink" | "purple" | "blue" | "yellow";
  size?: "sm" | "md" | "lg";
};

const variantStyles = {
  primary:
    "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.45)] hover:-translate-y-0.5",
  secondary:
    "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100",
  danger:
    "bg-red-500 text-white hover:bg-red-600",
  pink:
    "bg-gradient-to-r from-pink-light to-pink text-ink hover:shadow-glow hover:-translate-y-1 transition-all",
  purple:
    "bg-gradient-to-r from-purple-light to-purple text-ink hover:shadow-glow-purple hover:-translate-y-1 transition-all",
  blue:
    "bg-gradient-to-r from-blue-light to-blue text-ink hover:shadow-glow-blue hover:-translate-y-1 transition-all",
  yellow:
    "bg-gradient-to-r from-yellow-light to-yellow text-ink hover:shadow-soft hover:-translate-y-1 transition-all",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed hover:transform-none",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
