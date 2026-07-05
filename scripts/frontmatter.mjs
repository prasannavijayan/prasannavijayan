// Tiny YAML-frontmatter helpers shared by the git hook (stamp-published.mjs) and
// the dev review writer (apps/blog/integrations/provenance.mjs). Deliberately
// minimal + dependency-free; slated to move into the `astro-provenance` package.

/** Extract the first `--- ... ---` block. Returns { match, block } or null. */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? { match: m[0], block: m[1] } : null;
}

/** Read a scalar field's value (quotes stripped), or undefined. */
export function readField(block, key) {
  const m = block.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined;
}

/** Set a field (replacing in place, or appending if absent). */
export function setField(block, key, value) {
  const line = `${key}: "${value}"`;
  const re = new RegExp(`^${key}:.*$`, "m");
  return re.test(block) ? block.replace(re, line) : `${block}\n${line}`;
}

/** Splice an updated frontmatter block back into the document. */
export function replaceFrontmatter(text, parsed, newBlock) {
  return text.replace(parsed.match, `---\n${newBlock}\n---`);
}

/** Local ISO timestamp with seconds, e.g. "2026-07-05T17:04:22". */
export function nowStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Human-friendly span: minutes, then hours, then days. */
export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const minutes = Math.round(ms / 60_000);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
