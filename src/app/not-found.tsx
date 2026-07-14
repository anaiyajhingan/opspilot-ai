import { CompassIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[--background] px-6 text-center text-[--foreground]">
      <CompassIcon className="size-8 text-[--muted-foreground]" />
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-[--muted-foreground]">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
