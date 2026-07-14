"use client";

import { signIn } from "next-auth/react";
import * as React from "react";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.35a7.2 7.2 0 0 1 0-4.7V6.56H1.3a12 12 0 0 0 0 10.88l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.56l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"
      />
    </svg>
  );
}

export function GoogleButton({ callbackUrl }: { callbackUrl?: string }) {
  const [isPending, setIsPending] = React.useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        void signIn("google", { callbackUrl: callbackUrl ?? "/dashboard" });
      }}
    >
      <GoogleIcon />
      {isPending ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
