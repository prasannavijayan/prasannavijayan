import { z } from "astro:content";

// ─────────────────────────────────────────────────────────────────────────────
// Provenance — draft/publish status + time-to-publish tracking for content.
//
// This module is intentionally self-contained so it can be extracted into a
// standalone package (e.g. `astro-provenance`) once the shape settles. Keep the
// blog's coupling to it limited to: the schema (below), the <Provenance> badge,
// and the stamp-published git hook.
// ─────────────────────────────────────────────────────────────────────────────

/** Zod fields to spread into a content collection's schema. */
export const provenanceFields = {
  status: z.enum(["draft", "published"]).default("draft"),
  /** ISO datetime string with seconds, set when the post is created. */
  created: z.string(),
  /** Filled by the hook when status flips to published (ISO, to the second). */
  publishedAt: z.string().default(""),
  /** Filled by the hook: created → publishedAt, e.g. "12 minutes" / "3 days". */
  timeToPublish: z.string().default(""),
  // Actual review time, captured by the dev Review Timer (Start → Complete).
  // Preferred over timeToPublish when present.
  reviewStartedAt: z.string().default(""),
  reviewCompletedAt: z.string().default(""),
  reviewTook: z.string().default(""),
  /** Human-readable authorship note. */
  attribution: z.string().default("AI written, Human reviewed"),
};

/**
 * Whether a post should be shown.
 * In `astro dev` every post is visible (draft reading mode); a production build
 * (`astro build`) shows only published posts.
 */
export function isVisible(status: string): boolean {
  return import.meta.env.DEV || status === "published";
}

/** Format an ISO string as a readable date, e.g. "5 Jul 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
