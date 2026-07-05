import { useEffect } from "react";
import { useTheme } from "@pv/ui";
import darkIcon from "@pv/logos/pvy-dark.svg";
import lightIcon from "@pv/logos/pvy-light.svg";

/** Swaps the tab favicon to match the active theme (dark ↔ light). */
export function Favicon() {
  const { isDark } = useTheme();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = isDark ? darkIcon : lightIcon;
  }, [isDark]);

  return null;
}
