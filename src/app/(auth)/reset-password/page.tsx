import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token ?? ""} />
      </CardContent>
    </Card>
  );
}
