"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Phase 9+ routes this through src/lib/logger.ts to a real
    // observability backend instead of the console.
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[--background] px-6 text-center text-[--foreground]">
      <AlertTriangle className="size-8 text-[--sev-1]" />
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-sm text-[--muted-foreground]">
          An unexpected error occurred. Try again, and if it keeps happening, contact your
          workspace admin.
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
