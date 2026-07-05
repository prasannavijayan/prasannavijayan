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

/** Human-friendly span between two instants: minutes, then hours, then days. */
export function formatTimeToPublish(from: Date | string, to: Date | string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const minutes = Math.round(ms / 60_000);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
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
