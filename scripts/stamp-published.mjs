#!/usr/bin/env node
// Pre-commit: stamp blog posts as they transition draft → published.
//
// For every staged post under apps/blog/src/content/blog/ whose `status` is
// `published` but `publishedAt` is still empty, this:
//   • sets `publishedAt` to now (ISO, to the second)
//   • sets `reviewTook` to the created → publishedAt span ("12 minutes" / "3 days")
//   • re-stages the file so the stamps land in the same commit
//
// It never blocks a commit — on any error it logs and exits 0.
//
// (Slated to become the `astro-provenance` package's git hook once the shape settles.)

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CONTENT_DIR = "apps/blog/src/content/blog/";

/** Local ISO timestamp with seconds, e.g. "2026-07-05T17:04:22". */
function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Human-friendly span: minutes under a day, else days. */
function formatReviewTook(fromISO, to) {
  const ms = to.getTime() - new Date(fromISO).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  const minutes = Math.round(ms / 60_000);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function setField(frontmatter, key, value) {
  const line = `${key}: "${value}"`;
  const re = new RegExp(`^${key}:.*$`, "m");
  return re.test(frontmatter) ? frontmatter.replace(re, line) : `${frontmatter}\n${line}`;
}

function readField(frontmatter, key) {
  const m = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined;
}

try {
  const staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
    .split("\n")
    .filter((f) => f.startsWith(CONTENT_DIR) && f.endsWith(".md"));

  for (const file of staged) {
    const text = readFileSync(file, "utf8");
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;

    const block = fm[1];
    if (readField(block, "status") !== "published") continue;
    if (readField(block, "publishedAt")) continue; // already stamped

    const created = readField(block, "created");
    const stamp = nowStamp();
    const took = created ? formatReviewTook(created, new Date()) : "";

    let next = setField(block, "publishedAt", stamp);
    next = setField(next, "reviewTook", took);

    writeFileSync(file, text.replace(fm[0], `---\n${next}\n---`));
    execSync(`git add ${JSON.stringify(file)}`);
    console.log(`✓ published ${file} — publishedAt ${stamp}, review took ${took || "n/a"}`);
  }
} catch (err) {
  console.error("stamp-published: skipped (", err.message, ")");
}

process.exit(0);
