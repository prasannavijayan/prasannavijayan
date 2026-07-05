---
title: "structuredClone(): stop deep-copying with JSON"
description: "The JSON.parse(JSON.stringify()) trick silently mangles your data. Here's the one-liner that replaces it."
tags: ["javascript", "objects"]
status: draft
created: "2026-07-05T17:02:05"
publishedAt: ""
reviewTook: ""
attribution: "AI written, Human reviewed"
---

For years, the go-to way to deep-copy an object in JavaScript was this:

```js
const copy = JSON.parse(JSON.stringify(original));
```

It works often enough that people stop questioning it. But it's a leaky trick, and the leaks are quiet.

## What JSON silently loses

Serialize-then-parse can only represent what JSON can represent. Everything else gets dropped or corrupted:

```js
const original = {
  when: new Date("2026-01-01"),
  count: undefined,
  tag: Symbol("id"),
  big: 10n,
  fn: () => "hi",
  nested: { set: new Set([1, 2]) },
};

const copy = JSON.parse(JSON.stringify(original));
// {
//   when: "2026-01-01T00:00:00.000Z"  ← Date became a string
//   // count, tag, fn all gone
//   // big: 10n throws! "Do not know how to serialize a BigInt"
//   nested: { set: {} }               ← Set became an empty object
// }
```

Dates flatten to strings, `undefined` and functions vanish, `Set`/`Map` become `{}`, and a single `BigInt` anywhere throws outright. If the corruption happens deep in a nested object, you often don't notice until something downstream breaks.

## The replacement

`structuredClone()` is a built-in global (Node 17+, and every modern browser) that does a true deep copy using the structured clone algorithm:

```js
const copy = structuredClone(original);

copy.when instanceof Date;        // true
copy.nested.set instanceof Set;   // true
copy.big === 10n;                 // true
```

Dates stay Dates, `Set`/`Map`/`ArrayBuffer`/typed arrays survive, and `BigInt` is fine. It also handles **circular references**, which the JSON trick can't do at all:

```js
const a = {};
a.self = a;
JSON.stringify(a);     // ❌ TypeError: circular structure
structuredClone(a);    // ✅ works, copy.self === copy
```

## Where it stops

`structuredClone` copies data, not behavior. Two things it won't do:

- **Functions** throw a `DataCloneError`. So do DOM nodes.
- **Class instances lose their prototype** — you get a plain object with the same fields, not an instance of your class.

```js
class Point { constructor(x) { this.x = x; } }
const p = structuredClone(new Point(1));
p instanceof Point;   // false — it's a plain { x: 1 }
```

If you need methods or the prototype chain preserved, `structuredClone` isn't your tool — reach for a class-aware clone or reconstruct the instance yourself.

## The rule of thumb

- Copying **plain data** (config, API responses, state)? Use `structuredClone`.
- Copying **one level** shallowly? `{ ...obj }` or `structuredClone` are both fine — but remember spread only copies the top level.
- Copying things with **methods, DOM nodes, or class identity**? Neither the JSON trick nor `structuredClone` fits; handle it explicitly.

The takeaway: `JSON.parse(JSON.stringify(x))` was always a workaround for a missing primitive. That primitive now exists. Delete the trick.
