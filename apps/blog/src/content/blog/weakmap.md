---
title: "WeakMap: private data and leak-free caches"
description: "Attach data to objects that garbage-collects itself. No _privateFields, no memory leaks."
tags: ["javascript", "memory"]
status: draft
created: "2026-07-05T17:34:10"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
---

`WeakMap` is one of those built-ins people skim past because the use case isn't obvious. But it solves two real problems cleanly: private data, and caches that don't leak.

## What makes it "weak"

A normal `Map` holds its keys strongly. As long as the Map is alive, its keys can never be garbage-collected — even if nothing else references them:

```js
let cache = new Map();
let el = document.querySelector(".widget");
cache.set(el, computeExpensiveThing(el));

el.remove();
el = null;
// The element is gone from the DOM and unreferenced —
// but cache still holds it. It can never be collected. Leak.
```

A `WeakMap` holds keys **weakly**. If the key object becomes unreachable everywhere else, the engine is free to collect it and drop the entry automatically:

```js
let cache = new WeakMap();
let el = document.querySelector(".widget");
cache.set(el, computeExpensiveThing(el));

el.remove();
el = null;
// Nothing else references the element → it (and its cache entry)
// can be garbage-collected. No leak, no manual cleanup.
```

That's the whole superpower: the cache entry's lifetime is tied to the key's lifetime.

## Use case 1: per-object caching

Memoizing something expensive per DOM node, per request object, or per component instance is the textbook fit:

```js
const layoutCache = new WeakMap();

function getLayout(el) {
  if (layoutCache.has(el)) return layoutCache.get(el);
  const layout = measureLayout(el); // expensive
  layoutCache.set(el, layout);
  return layout;
}
```

When the element disappears, so does its cached layout — you never think about eviction.

## Use case 2: truly private data

Before `#private` class fields, `WeakMap` was *the* way to attach data to an instance that outside code can't reach. It still works well when you want privacy without touching the object's own shape:

```js
const balances = new WeakMap();

class Account {
  constructor(initial) {
    balances.set(this, initial);
  }
  deposit(n) {
    balances.set(this, balances.get(this) + n);
  }
  get balance() {
    return balances.get(this);
  }
}
```

The `balances` map isn't exported, so nothing outside this module can read or tamper with it — and there's no `_balance` property hanging off the instance for someone to poke at.

## The constraints (which are the point)

- **Keys must be objects** (or symbols) — primitives can't be weakly held.
- **Not iterable**: no `.keys()`, `.size`, or `for...of`. You can't enumerate a WeakMap, because entries can vanish at any moment. If you need to list contents, you want a regular `Map`.

## WeakRef, briefly

Its cousin `WeakRef` holds a weak reference to a single object you can `.deref()` (getting the object or `undefined` if collected). It's a lower-level, sharper tool — useful, but reach for `WeakMap` first; it covers the common cases without you having to reason about GC timing.

The takeaway: when you want to associate data with an object **for exactly as long as that object lives**, `WeakMap` does the bookkeeping for you. It's the rare API where the limitations *are* the feature.
