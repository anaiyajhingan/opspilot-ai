import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Generic, prop-driven empty state — carries no business logic (design
 * doc, section 8). Feature pages supply their own copy and action; this
 * component only handles layout and treats emptiness as an invitation to
 * act (design doc's writing guidance), not just a blank space.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[--border] px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-[--surface-hover]">
        <Icon className="size-5 text-[--muted-foreground]" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[--foreground]">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-[--muted-foreground]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
