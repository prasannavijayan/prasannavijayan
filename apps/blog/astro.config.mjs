// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Static content blog for blog.prasannavijayan.in
export default defineConfig({
  site: "https://blog.prasannavijayan.in",
  integrations: [react()],
});
