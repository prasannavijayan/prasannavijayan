import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { provenanceFields } from "./lib/provenance";

// Blog posts live as Markdown in src/content/blog/.
// Workflow:
//   1. A post is created with `status: draft` and a `created` timestamp (to the second).
//   2. A human reviews it and flips `status` to `published`.
//   3. The pre-commit hook (scripts/stamp-published.mjs) fills `publishedAt` (to the
//      second) and `reviewTook` (created → publishedAt, in minutes or days).
// Only `published` posts are rendered on the site.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    ...provenanceFields,
  }),
});

export const collections = { blog };
