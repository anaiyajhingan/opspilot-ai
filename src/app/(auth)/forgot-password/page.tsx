import Link from "next/link";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ForgotPasswordForm />
        <p className="text-center text-sm text-[--muted-foreground]">
          <Link href="/login" className="text-[--accent] hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
