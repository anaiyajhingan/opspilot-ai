import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Placeholder marketing page. The full landing page (hero, features,
 * pricing, testimonials, FAQ — see Plan doc, Phase 8) is deliberately
 * built last so it doesn't block the product surfaces underneath it.
 */
export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-md bg-[--accent] text-sm font-bold text-white">
        O
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">OpsPilot AI</h1>
      <p className="max-w-md text-sm text-[--muted-foreground]">
        AI-powered incident management for modern engineering teams. The full landing page
        ships in a later phase — this build is focused on the product foundation first.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </main>
  );
}
