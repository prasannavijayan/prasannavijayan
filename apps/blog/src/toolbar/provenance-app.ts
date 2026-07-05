import { defineToolbarApp } from "astro/toolbar";
import { getReview, startReview, completeReview, resetReview, type ReviewRecord } from "@/lib/review-db";

// "Review Timer" dev toolbar app. On a draft post page it lets you Start / Complete
// a review; the elapsed time is stored in IndexedDB and, on completion, POSTed to
// the dev middleware which writes it into the post's frontmatter.
export default defineToolbarApp({
  init(canvas, _app, server) {
    const root = document.createElement("astro-dev-toolbar-window");
    root.style.cssText = "font-family: system-ui, sans-serif; min-width: 260px;";
    canvas.appendChild(root);

    let timer: number | undefined;

    function currentPost(): { slug: string; status: string } | null {
      const slug = document.body.dataset.postSlug;
      const status = document.body.dataset.postStatus ?? "";
      return slug ? { slug, status } : null;
    }

    function fmt(ms: number): string {
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      const pad = (n: number) => String(n).padStart(2, "0");
      return h > 0 ? `${h}:${pad(m % 60)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
    }

    function stopTimer() {
      if (timer) window.clearInterval(timer);
      timer = undefined;
    }

    async function render() {
      stopTimer();
      const post = currentPost();

      if (!post) {
        root.innerHTML = `<p style="margin:0;color:#888;font-size:13px;">Open a draft post to time your review.</p>`;
        return;
      }

      const record = await getReview(post.slug);
      const heading = `<div style="font-weight:600;font-size:13px;margin-bottom:4px;">Review Timer</div>
        <div style="font-size:12px;color:#888;margin-bottom:12px;">${post.slug}</div>`;

      if (!record) {
        root.innerHTML = heading;
        const btn = makeButton("▶ Start review", "#1a73e8");
        btn.addEventListener("click", async () => {
          await startReview(post.slug);
          render();
        });
        root.appendChild(btn);
        return;
      }

      if (record.status === "in-progress") {
        root.innerHTML = heading;
        const elapsed = document.createElement("div");
        elapsed.style.cssText = "font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;margin-bottom:12px;";
        root.appendChild(elapsed);

        const tick = () => (elapsed.textContent = fmt(Date.now() - record.startedAt));
        tick();
        timer = window.setInterval(tick, 1000);

        const btn = makeButton("■ Review completed", "#188038");
        btn.addEventListener("click", async () => {
          stopTimer();
          const done = await completeReview(post.slug);
          if (done) await save(done);
          render();
        });
        root.appendChild(btn);
        return;
      }

      // done
      root.innerHTML = heading;
      const took = record.completedAt ? fmt(record.completedAt - record.startedAt) : "—";
      const info = document.createElement("p");
      info.style.cssText = "margin:0 0 12px;font-size:13px;color:#188038;";
      info.textContent = `✓ Recorded — ${took}`;
      root.appendChild(info);

      const btn = makeButton("↻ Review again", "#5f6368");
      btn.addEventListener("click", async () => {
        await resetReview(post.slug);
        render();
      });
      root.appendChild(btn);
    }

    async function save(record: ReviewRecord) {
      try {
        await fetch("/__provenance/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: record.slug,
            startedAt: record.startedAt,
            completedAt: record.completedAt,
          }),
        });
      } catch (err) {
        console.warn("[provenance] failed to write review time:", err);
      }
    }

    function makeButton(label: string, color: string): HTMLButtonElement {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.style.cssText = `display:block;width:100%;padding:8px 12px;border:none;border-radius:8px;background:${color};color:#fff;font-size:13px;font-weight:500;cursor:pointer;`;
      return btn;
    }

    server.on?.("connected", () => render());
    root.getRootNode(); // no-op keep reference
    render();
    (_app as unknown as { onToggled?: (cb: (e: { state: boolean }) => void) => void }).onToggled?.(({ state }) => {
      if (state) render();
      else stopTimer();
    });
  },
});
