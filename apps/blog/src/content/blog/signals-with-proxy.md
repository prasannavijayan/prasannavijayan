---
title: "How signals work: reactivity with Proxy in 4 minutes"
description: "Build a tiny reactive object from scratch to see what Vue and Solid do under the hood."
tags: ["javascript", "reactivity"]
status: draft
created: "2026-07-05T17:51:20"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
---

"Signals" and "reactivity" sound like framework magic. The core idea is small enough to build in a few lines, and doing so demystifies Vue, Solid, and friends. The key primitive is `Proxy`.

## Proxy: intercept get and set

A `Proxy` wraps an object and lets you run code whenever a property is read or written:

```js
const raw = { count: 0 };
const observed = new Proxy(raw, {
  get(target, key) {
    console.log("read", key);
    return target[key];
  },
  set(target, key, value) {
    console.log("write", key, value);
    target[key] = value;
    return true; // signal success
  },
});

observed.count;      // logs "read count"
observed.count = 5;  // logs "write count 5"
```

That's the whole foundation. Reactivity is just: **on read, remember who's watching; on write, re-run them.**

## Tracking the current watcher

We need a notion of "the function currently running," so a read can record its dependency:

```js
let activeEffect = null;

function effect(fn) {
  activeEffect = fn;
  fn();              // run it; reads during this run get tracked
  activeEffect = null;
}
```

## Wiring it together

Each property keeps a set of effects that read it. On read we add the active effect (`track`); on write we re-run them all (`trigger`):

```js
function reactive(obj) {
  const deps = new Map(); // key -> Set<effect>

  return new Proxy(obj, {
    get(target, key) {
      if (activeEffect) {
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key).add(activeEffect); // track
      }
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      deps.get(key)?.forEach((fn) => fn()); // trigger
      return true;
    },
  });
}
```

## It just works

```js
const state = reactive({ count: 0, name: "Ada" });

effect(() => {
  console.log(`count is ${state.count}`);
});
// logs "count is 0" immediately, and registers this effect
// as a dependency of `count` (because it read state.count)

state.count = 1; // logs "count is 1"
state.count = 2; // logs "count is 2"

state.name = "Bob"; // logs nothing — the effect never read `name`
```

That last line is the important one. The effect only re-runs when `count` changes, because dependency tracking is **per-property**, captured automatically during the effect's run. Nobody declared a dependency list; reading the value *was* the declaration.

## This is the real thing, scaled up

What frameworks add on top is engineering, not new magic:

- **Nested/deep reactivity** — wrap nested objects in `reactive` lazily on access.
- **Computed values** — an effect whose result is cached and itself reactive.
- **Batching** — collect triggers and flush once, instead of re-running synchronously on every write.
- **Cleanup** — remove stale effect subscriptions before each re-run.

Vue's reactivity is essentially this `Proxy` approach with those refinements. Solid and signal libraries use the same track-on-read / trigger-on-write model with a slightly different API surface.

The takeaway: reactivity isn't a compiler trick or framework voodoo. It's `Proxy` intercepting reads to record dependencies and writes to replay them. Once you've built the 20-line version, the big frameworks stop feeling like black boxes.
