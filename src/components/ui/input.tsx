import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-1.5 text-sm text-[--foreground]",
          "placeholder:text-[--muted-foreground]",
          "transition-colors duration-150 ease-out",
          "focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-2 aria-invalid:ring-[--sev-1]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
