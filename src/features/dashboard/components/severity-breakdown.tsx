import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META } from "@/lib/constants";
import type { SeverityBreakdown } from "@/server/repositories/dashboard.repository";

type SeverityBreakdownProps = {
  breakdown: SeverityBreakdown;
  isLoading?: boolean;
};

/**
 * Severity breakdown card showing distribution of open incidents by severity.
 *
 * Uses the design system's severity color coding (SEVERITY_META) to ensure
 * consistency across the application.
 */
export function SeverityBreakdown({ breakdown, isLoading }: SeverityBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Severity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const severities = [
    { key: "sev1" as const, label: SEVERITY_META.SEV1.label },
    { key: "sev2" as const, label: SEVERITY_META.SEV2.label },
    { key: "sev3" as const, label: SEVERITY_META.SEV3.label },
    { key: "sev4" as const, label: SEVERITY_META.SEV4.label },
  ];

  const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {severities.map((severity) => {
            const count = breakdown[severity.key];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const variant = severity.key === "sev1" ? "sev1" : severity.key === "sev2" ? "sev2" : severity.key === "sev3" ? "sev3" : "sev4";

            return (
              <div key={severity.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={variant as any}>{severity.label}</Badge>
                  <span className="text-sm text-[--muted-foreground]">{percentage}%</span>
                </div>
                <span className="text-sm font-medium text-[--foreground]">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
