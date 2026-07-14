import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/features/auth/components/google-button";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to OpsPilot AI</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[--border]" />
          <span className="text-xs text-[--muted-foreground]">or</span>
          <div className="h-px flex-1 bg-[--border]" />
        </div>

        <GoogleButton />

        <p className="text-center text-sm text-[--muted-foreground]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[--accent] hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
