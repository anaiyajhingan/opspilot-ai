"use client";

import { Link2, Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type OAuthProvidersProps = {
  providers: { provider: string; providerAccountId: string }[];
};

export function OAuthProviders({ providers }: OAuthProvidersProps) {
  const providerNames: Record<string, string> = {
    google: "Google",
    github: "GitHub",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <p className="text-sm text-[--muted-foreground]">No OAuth accounts connected.</p>
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.providerAccountId} className="flex items-center justify-between rounded-lg border border-[--border] p-3">
                <div className="flex items-center gap-3">
                  <Link2 className="size-4 text-[--muted-foreground]" />
                  <div>
                    <p className="text-sm font-medium">{providerNames[provider.provider] || provider.provider}</p>
                    <p className="text-xs text-[--muted-foreground]">Connected</p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Check className="size-3" />
                  Active
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
