---
title: "?? is not ||: the bug that ships to prod"
description: "Nullish coalescing looks like a fancy OR. The difference is exactly the bug that survives code review."
tags: ["javascript", "gotchas"]
status: draft
created: "2026-07-05T17:22:19"
publishedAt: ""
reviewTook: ""
attribution: "AI written, Human reviewed"
---

You've seen `||` used for defaults forever:

```js
const port = config.port || 3000;
const name = user.name || "Anonymous";
```

And you've seen `??` show up as a "modern" replacement. They usually behave the same, which is exactly why the difference is dangerous — it only shows up for specific values, and those values are often legitimate.

## The one difference

- `||` falls back when the left side is **falsy**: `false`, `0`, `""`, `NaN`, `null`, `undefined`.
- `??` falls back only when the left side is **nullish**: `null` or `undefined`.

So they diverge for `0`, `""`, and `false` — values that are falsy but perfectly valid.

```js
const count = 0;
count || 10;   // 10  ← wrong, 0 was a real value
count ?? 10;   // 0   ← correct

const label = "";
label || "N/A"; // "N/A" ← wrong if empty string was intentional
label ?? "N/A"; // ""    ← correct
```

## Where it actually bites

The classic bug is a numeric config or a toggle:

```js
function createServer(opts) {
  const port = opts.port || 8080;         // ❌
  const retries = opts.retries || 3;      // ❌
  const verbose = opts.verbose || true;   // ❌ always true!
}

createServer({ port: 0, retries: 0, verbose: false });
// port → 8080, retries → 3, verbose → true
// every single one ignored the caller's value
```

Passing `0` to mean "pick a free port," `0` to mean "don't retry," or `false` to mean "quiet" all get silently overridden. Swap to `??` and each falls back **only** when the option is truly absent:

```js
const port = opts.port ?? 8080;         // 0 stays 0
const retries = opts.retries ?? 3;      // 0 stays 0
const verbose = opts.verbose ?? true;   // false stays false
```

## The rule of thumb

Use `??` whenever `0`, `""`, or `false` could be a **valid value** — which is most config, form fields, counts, and flags. Reach for `||` only when you genuinely want *any* falsy value to trigger the fallback (rare, but e.g. `str.trim() || "empty"`).

## The syntax gotcha

You can't mix `??` with `||` or `&&` without parentheses — the language forbids it to remove ambiguity:

```js
a ?? b || c;      // ❌ SyntaxError
(a ?? b) || c;    // ✅ explicit
a ?? (b || c);    // ✅ explicit
```

That error is the language doing you a favor: it's making you state precedence instead of guessing.

The takeaway: `||` asks "is this falsy?" `??` asks "is this missing?" Those are different questions, and picking the wrong one produces a bug that passes every test where the value happens to be non-zero and non-empty — then fails the day a real `0` shows up.
