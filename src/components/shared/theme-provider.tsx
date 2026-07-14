"use client";

import * as React from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "opspilot-theme";

/**
 * Minimal, dependency-free theme provider. The app is dark-mode-first
 * (design doc, section 9): dark is the default and the only theme applied
 * until the user explicitly opts into light mode, avoiding a flash of the
 * wrong theme on first load.
 */
function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read synchronously in the initializer (not via a post-mount effect) so
  // there's no setState-in-effect cascade. The <html> tag carries
  // suppressHydrationWarning (see layout.tsx) to accept the one-time
  // server/client class mismatch this trades off against.
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);

  React.useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
