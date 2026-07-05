---
title: "Debounce vs throttle, built from scratch"
description: "They look almost identical and do opposite things. Here's how to tell them apart — and implement both in a few lines."
tags: ["javascript", "performance"]
status: draft
created: "2026-07-05T17:06:31"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
---

Debounce and throttle both limit how often a function runs. People reach for whichever they remember, and half the time it's the wrong one. The difference is simple once you say it out loud.

- **Debounce:** wait until the activity *stops*, then run once.
- **Throttle:** run at most once per interval *while* the activity continues.

Search-as-you-type wants debounce (fire when the user pauses). A scroll or resize handler wants throttle (fire steadily, but not on every pixel).

## Debounce

Every call resets the timer. The function only runs when calls stop for `wait` ms.

```js
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

const search = debounce((q) => fetchResults(q), 300);
input.addEventListener("input", (e) => search(e.target.value));
```

Type "hello" quickly and `fetchResults` fires **once**, 300ms after the last keystroke — not five times.

## Throttle

The function runs immediately, then ignores calls until the interval passes.

```js
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

const onScroll = throttle(() => updateScrollSpy(), 200);
window.addEventListener("scroll", onScroll);
```

Scroll continuously and `updateScrollSpy` runs about every 200ms — smooth, but not hundreds of times per second.

## The subtlety: leading vs trailing

The naïve throttle above is **leading** — it fires on the first call, then goes quiet. If the user stops scrolling mid-interval, the very last position is dropped. Often you want a **trailing** call too, so the final state isn't lost:

```js
function throttle(fn, interval) {
  let last = 0;
  let timer;
  return function (...args) {
    const now = Date.now();
    const remaining = interval - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = undefined;
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = undefined;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

Now it fires on the leading edge *and* guarantees one final call on the trailing edge.

## Preserving `this` and arguments

Notice both use `fn.apply(this, args)` rather than calling `fn(...args)` directly. That keeps the wrapper transparent: it works as an event handler (where `this` is the element) and forwards every argument. Drop that, and subtle bugs appear the first time someone relies on `this`.

## When to just use a library

These are a few lines, but production versions handle `cancel()`, `flush()`, `maxWait`, and leading/trailing options. Lodash's `debounce`/`throttle` are battle-tested and worth it once you need those. But understanding the four lines means you'll never again pick the wrong one — or ship a search box that fires a request per keystroke.

The mental model to keep: **debounce collapses a burst into its end; throttle spreads a burst into a steady drip.**
