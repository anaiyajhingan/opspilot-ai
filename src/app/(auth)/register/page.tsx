import Link from "next/link";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/features/auth/components/google-button";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create your organization" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your organization</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RegisterForm />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[--border]" />
          <span className="text-xs text-[--muted-foreground]">or</span>
          <div className="h-px flex-1 bg-[--border]" />
        </div>

        <GoogleButton />

        <p className="text-center text-sm text-[--muted-foreground]">
          Already have an account?{" "}
          <Link href="/login" className="text-[--accent] hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
