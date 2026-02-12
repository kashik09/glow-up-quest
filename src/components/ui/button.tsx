import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-white shadow-soft hover:-translate-y-0.5 transition-transform",
  ghost: "border border-black/10 text-ink hover:border-black/20",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
