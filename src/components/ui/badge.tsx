import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[--accent] text-white",
        secondary: "border-[--border] bg-[--surface] text-[--foreground]",
        outline: "border-[--border] text-[--foreground]",
        success: "border-transparent bg-[--success]/15 text-[--success]",
        sev1: "border-transparent bg-[--sev-1]/15 text-[--sev-1]",
        sev2: "border-transparent bg-[--sev-2]/15 text-[--sev-2]",
        sev3: "border-transparent bg-[--sev-3]/15 text-[--sev-3]",
        sev4: "border-transparent bg-[--sev-4]/15 text-[--sev-4]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
