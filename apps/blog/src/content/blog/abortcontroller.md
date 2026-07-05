---
title: "AbortController is not just for fetch"
description: "One .abort() can cancel a request, a timeout, and a pile of event listeners at once. Here's the pattern."
tags: ["javascript", "async"]
status: draft
created: "2026-07-05T17:17:02"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
---

Most people meet `AbortController` as the way to cancel a `fetch`:

```js
const controller = new AbortController();
fetch("/api/data", { signal: controller.signal });
controller.abort(); // request cancelled → fetch rejects with AbortError
```

That's the famous use. But `AbortSignal` is a general-purpose cancellation token, and once you see it that way it cleans up a lot of code.

## Cancelling event listeners

`addEventListener` accepts a `signal`. When the signal aborts, the listener is removed — no matching `removeEventListener`, no stored function reference:

```js
const controller = new AbortController();
const { signal } = controller;

window.addEventListener("resize", onResize, { signal });
window.addEventListener("scroll", onScroll, { signal });
document.addEventListener("keydown", onKey, { signal });

// Later — remove all three at once:
controller.abort();
```

This is a huge win for component teardown. One `abort()` in a cleanup function detaches every listener you registered with that signal. No more mismatched add/remove pairs where you forgot the exact same options object.

## Timeouts that cancel

`AbortSignal.timeout(ms)` gives you a signal that auto-aborts, perfect for a fetch deadline:

```js
try {
  const res = await fetch("/api/slow", { signal: AbortSignal.timeout(5000) });
  const data = await res.json();
} catch (err) {
  if (err.name === "TimeoutError") console.log("took too long");
  else if (err.name === "AbortError") console.log("cancelled");
}
```

## Combining signals

Say you want a request cancelled if *either* the user navigates away *or* a 5-second deadline passes. `AbortSignal.any()` merges signals — it aborts as soon as any of them do:

```js
const userSignal = controller.signal;         // aborts on navigation
const timeout = AbortSignal.timeout(5000);    // aborts after 5s

const res = await fetch("/api/data", {
  signal: AbortSignal.any([userSignal, timeout]),
});
```

## Reacting to abort yourself

For your own async work, read `signal.aborted` and listen for the `abort` event. Here's a cancellable delay:

```js
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(signal.reason);
    }, { once: true });
  });
}
```

Now `delay` participates in the same cancellation as everything else — pass it the shared signal and it stops when the rest does.

## The mental model

Stop thinking "AbortController cancels fetch." Think: **a signal is a broadcast channel for 'stop now,' and anything can subscribe** — fetch, listeners, timers, your own promises. Create one controller per unit of work (a request, a screen, a task), thread its signal through everything that work touches, and tear the whole thing down with a single `abort()`.
