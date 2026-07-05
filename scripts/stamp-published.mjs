#!/usr/bin/env node
// Pre-commit: stamp blog posts as they transition draft → published.
//
// For every staged post under apps/blog/src/content/blog/ whose `status` is
// `published` but `publishedAt` is still empty, this:
//   • sets `publishedAt` to now (ISO, to the second)
//   • sets `timeToPublish` to the created → publishedAt span (fallback metric)
//   • re-stages the file so the stamps land in the same commit
//
// It never touches `reviewTook` — that's the *actual* review time captured by
// the dev Review Timer (apps/blog/integrations/provenance.mjs). The badge prefers
// reviewTook and falls back to timeToPublish.
//
// It never blocks a commit — on any error it logs and exits 0.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  parseFrontmatter,
  readField,
  setField,
  replaceFrontmatter,
  nowStamp,
  formatDuration,
} from "./frontmatter.mjs";

const CONTENT_DIR = "apps/blog/src/content/blog/";

try {
  const staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
    .split("\n")
    .filter((f) => f.startsWith(CONTENT_DIR) && f.endsWith(".md"));

  for (const file of staged) {
    const text = readFileSync(file, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) continue;

    if (readField(fm.block, "status") !== "published") continue;
    if (readField(fm.block, "publishedAt")) continue; // already stamped

    const created = readField(fm.block, "created");
    const stamp = nowStamp();
    const took = created ? formatDuration(Date.now() - new Date(created).getTime()) : "";

    let block = setField(fm.block, "publishedAt", stamp);
    block = setField(block, "timeToPublish", took);

    writeFileSync(file, replaceFrontmatter(text, fm, block));
    execSync(`git add ${JSON.stringify(file)}`);
    console.log(`✓ published ${file} — publishedAt ${stamp}, time to publish ${took || "n/a"}`);
  }
} catch (err) {
  console.error("stamp-published: skipped (", err.message, ")");
}

process.exit(0);
