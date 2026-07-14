import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmailAction(token ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.ok ? "Email verified" : "Verification failed"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-[--muted-foreground]">
          {result.ok
            ? "Your email is confirmed. You can now sign in."
            : result.error}
        </p>
        <Button asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
