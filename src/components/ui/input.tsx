import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
