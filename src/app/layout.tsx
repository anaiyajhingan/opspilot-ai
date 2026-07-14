import type { Metadata } from "next";
import type * as React from "react";

import "@/app/globals.css";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontMono, fontSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "OpsPilot AI — Incident Management for Modern Engineering Teams",
    template: "%s · OpsPilot AI",
  },
  description:
    "AI-powered incident management: monitor alerts, collaborate during outages, and generate root-cause analysis and postmortems automatically.",
  openGraph: {
    title: "OpsPilot AI",
    description: "AI-powered incident management for modern engineering teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
