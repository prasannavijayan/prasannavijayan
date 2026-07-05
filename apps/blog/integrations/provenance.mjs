import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  parseFrontmatter,
  setField,
  replaceFrontmatter,
  nowStamp,
  formatDuration,
} from "../../../scripts/frontmatter.mjs";

// Dev-only provenance tooling:
//   • registers the "Review Timer" Dev Toolbar app (Start / Complete)
//   • serves POST /__provenance/complete which writes the measured review time
//     into a post's frontmatter (reviewStartedAt / reviewCompletedAt / reviewTook)
// Both only exist during `astro dev`; nothing ships to the production build.
export default function provenance() {
  return {
    name: "provenance",
    hooks: {
      "astro:config:setup": ({ command, addDevToolbarApp }) => {
        if (command !== "dev") return;
        addDevToolbarApp({
          id: "provenance-review",
          name: "Review Timer",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/></svg>`,
          entrypoint: fileURLToPath(new URL("../src/toolbar/provenance-app.ts", import.meta.url)),
        });
      },

      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (req.method !== "POST" || !req.url || !req.url.startsWith("/__provenance/complete")) {
            return next();
          }
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            res.setHeader("Content-Type", "application/json");
            try {
              const { slug, startedAt, completedAt } = JSON.parse(body || "{}");
              if (!/^[a-z0-9-]+$/.test(slug || "")) throw new Error("invalid slug");

              const file = path.resolve(process.cwd(), "src/content/blog", `${slug}.md`);
              if (!existsSync(file)) throw new Error("post not found");

              const text = readFileSync(file, "utf8");
              const fm = parseFrontmatter(text);
              if (!fm) throw new Error("no frontmatter");

              const start = new Date(startedAt);
              const end = completedAt ? new Date(completedAt) : new Date();
              const took = formatDuration(end.getTime() - start.getTime());

              let block = setField(fm.block, "reviewStartedAt", nowStamp(start));
              block = setField(block, "reviewCompletedAt", nowStamp(end));
              block = setField(block, "reviewTook", took);
              writeFileSync(file, replaceFrontmatter(text, fm, block));

              res.end(JSON.stringify({ ok: true, reviewTook: took }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
        });
      },
    },
  };
}
