import { useTheme } from "@pv/ui";
// `?url` → resolve to a URL string, matching BlogLayout's favicon imports.
import darkLogo from "@pv/logos/pvy-blog-dark.svg?url";
import lightLogo from "@pv/logos/pvy-blog-light.svg?url";

/** The brand badge that matches the active theme (dark ↔ light). */
export function useLogo(): string {
  const { isDark } = useTheme();
  return isDark ? darkLogo : lightLogo;
}
