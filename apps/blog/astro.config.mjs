// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import expressiveCode from "astro-expressive-code";
import provenance from "./integrations/provenance.mjs";

// Static content blog for blog.prasannavijayan.in
export default defineConfig({
  site: "https://blog.prasannavijayan.in",
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
    }),
    react(),
    provenance(),
  ],
});
