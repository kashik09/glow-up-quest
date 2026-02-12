import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border-2 border-purple/20 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-all duration-200",
        "focus:outline-none focus:border-purple focus:shadow-glow-purple focus:bg-white",
        "hover:border-purple/40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
