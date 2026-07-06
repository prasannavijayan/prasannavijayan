import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type ThemeContextValue = { isDark: boolean; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialIsDark(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start `false` so the very first client render matches what a
  // server-rendered shell produced (Astro's client:load islands hydrate
  // against SSR output, which has no window and always defaults to light) —
  // reading localStorage/matchMedia synchronously here would return a
  // different value than the server on repeat visits and trigger a React
  // hydration-mismatch error. The real value is applied a tick later below.
  const [isDark, setIsDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsDark(getInitialIsDark());
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Skip the very first (pre-hydration-correction) pass so we never
    // clobber a stored "dark" preference with the placeholder "light" value.
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, hydrated]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

const moonSVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const sunSVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
      title="Toggle theme"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {isDark ? sunSVG : moonSVG}
    </button>
  );
}
