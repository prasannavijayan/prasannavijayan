// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import swup from "@swup/astro";
import provenance from "./integrations/provenance.mjs";

// Static content blog for blog.prasannavijayan.in
export default defineConfig({
  site: "https://blog.prasannavijayan.in",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
    }),
    react(),
    provenance(),
    // Transitions between posts/pages without a full reload; Header/Footer live
    // outside the swapped <main> container, so they stay mounted across nav.
    // theme:false + our own .transition-slide rules in global.css give a
    // directional rise/sink instead of the built-in plain fade.
    swup({ theme: false }),
  ],
});
