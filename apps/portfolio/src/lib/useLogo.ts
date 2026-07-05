import { useTheme } from "@pv/ui";
import darkLogo from "@pv/logos/pvy-dark.svg";
import lightLogo from "@pv/logos/pvy-light.svg";

/** The brand badge that matches the active theme (dark ↔ light). */
export function useLogo(): string {
  const { isDark } = useTheme();
  return isDark ? darkLogo : lightLogo;
}
