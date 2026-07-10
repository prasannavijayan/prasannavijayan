---
title: "AbortController is not just for fetch"
description: "One .abort() can cancel a request, a timeout, and a pile of event listeners at once. Here's the pattern."
tags: ["javascript", "async"]
status: "published"
created: "2026-07-05T17:17:02"
publishedAt: "2026-07-10T22:07:57"
timeToPublish: "5 days"
attribution: "AI written, Human reviewed"
reviewStartedAt: "2026-07-10T21:47:34"
reviewCompletedAt: "2026-07-10T22:07:57"
reviewTook: "20 minutes"
---

Most people meet `AbortController` as the way to cancel a `fetch`:

```js
const controller = new AbortController();
fetch("/api/data", { signal: controller.signal });
controller.abort(); // request cancelled → fetch rejects with AbortError
```

That's the famous use. But `AbortSignal` is a general-purpose cancellation token, and once you see it that way it cleans up a lot of code.

## 📍 Where it lives

`AbortController` and `AbortSignal` are built into the platform — no import, no `npm install`. They're **Web APIs** (defined in the WHATWG DOM standard), available as globals in every modern browser. Despite the name and the fetch association, they're not fetch-specific or even browser-specific: **Node.js** (since v15), **Deno**, and **Bun** all ship them as globals too, so the exact same cancellation code runs server-side.

## 🎛️ Controller vs. signal

The two show up together constantly, and it's easy to blur them — but they're two separate objects with opposite jobs:

- **`AbortController`** is the *trigger*. One method that matters, `.abort()`, and one property, `.signal`. You keep the controller to yourself — it's the only thing that can *start* a cancellation.
- **`AbortSignal`** is the *token you hand out*. It's read-only: `.aborted` (a boolean), `.reason` (why it aborted), and an `abort` event you can listen for — but no `.abort()` method of its own. You pass the signal to everything that should react: `fetch`, `addEventListener`, your own code.

```js
const controller = new AbortController();
const { signal } = controller;

signal.aborted;      // false — nothing has cancelled yet
controller.abort();  // only the controller can pull the trigger
signal.aborted;      // true
signal.reason;       // why it aborted (a DOMException named "AbortError" by default)
```

One controller owns exactly one signal — `controller.signal` always hands back the same object. The split is deliberate: whoever holds the signal can *react* to cancellation but can't *cause* it. You keep the trigger; you give out the listener. (A few signals come ready-made without a controller you hold — `AbortSignal.timeout()` is one, just below — but the roles are the same: something triggers, the signal broadcasts.)

## 👂 Cancelling event listeners

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

## ⏱️ Timeouts that cancel

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

## 🔗 Combining signals

Say you want a request cancelled if *either* the user navigates away *or* a 5-second deadline passes. `AbortSignal.any()` merges signals — it aborts as soon as any of them do:

```js
const userSignal = controller.signal;         // aborts on navigation
const timeout = AbortSignal.timeout(5000);    // aborts after 5s

const res = await fetch("/api/data", {
  signal: AbortSignal.any([userSignal, timeout]),
});
```

## 🎧 Reacting to abort yourself

`fetch` and `addEventListener` already know how to obey a signal. But what about your *own* async work? You wire it up the same way — read `signal.aborted` for the "was it already cancelled?" case, and listen for the `abort` event for the "cancelled while I was waiting" case.

Here's a cancellable `delay` — a `setTimeout` wrapped in a promise that also respects a signal. Broken down, it's just four small jobs:

```js
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    // 1. Already cancelled before we even start? Bail out immediately.
    //    (signal.reason is why it was aborted — an AbortError by default.)
    if (signal?.aborted) return reject(signal.reason);

    // 2. The actual wait: when the timer fires, the promise resolves.
    const id = setTimeout(resolve, ms);

    // 3. If the signal aborts *while we're waiting*, cancel the pending
    //    timer and reject instead of resolving.
    // 4. { once: true } auto-removes this listener after it runs, so the
    //    listener itself never lingers — no cleanup for you to forget.
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(signal.reason);
    }, { once: true });
  });
}
```

The `signal?` (optional chaining) means the signal is optional — call `delay(1000)` with no signal and it's just a plain delay; pass one and it becomes cancellable.

### A running example

Because `delay` speaks the same signal "language" as `fetch`, you can thread **one** signal through both and cancel the whole pipeline with a single `abort()`. Here we wait a second, then fetch a Star Wars character from [SWAPI](https://swapi.dev) — and let the user back out of either step:

```js
// Wait `ms`, then fetch character #id — both cancellable via one signal.
async function loadCharacter(id, signal) {
  await delay(1000, signal);                       // cancellable pause
  const res = await fetch(
    `https://swapi.dev/api/people/${id}/`,
    { signal },                                    // fetch shares the SAME signal
  );
  return res.json();
}

const controller = new AbortController();

loadCharacter(1, controller.signal)
  .then((char) => console.log(char.name))          // → "Luke Skywalker"
  .catch((err) => {
    if (err.name === "AbortError") console.log("cancelled");
    else throw err;                                // a real network error, not a cancel
  });

// Change your mind within that first second? One line stops both the
// delay AND the fetch — whichever one is currently in flight:
controller.abort(); // logs "cancelled"
```

Let the code run to completion and it logs `Luke Skywalker`. Call `controller.abort()` first and it logs `cancelled` instead — and crucially, it doesn't matter *which* step was running when you aborted. The delay and the fetch both watch the same signal, so one `abort()` tears the whole thing down.

## 🧠 The mental model

Stop thinking "AbortController cancels fetch." Think: **a signal is a broadcast channel for 'stop now,' and anything can subscribe** — fetch, listeners, timers, your own promises. Create one controller per unit of work (a request, a screen, a task), thread its signal through everything that work touches, and tear the whole thing down with a single `abort()`.
