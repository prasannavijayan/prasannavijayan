---
title: "Array methods you're still writing by hand"
description: "at(), findLast(), flatMap(), and Object.groupBy() replace loops you probably still write. A quick tour."
tags: ["javascript", "arrays"]
status: draft
created: "2026-07-05T17:28:44"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
---

The `Array` prototype quietly grew some genuinely useful methods over the last few years. Here are four that delete boilerplate you're probably still writing.

## `at()` — negative indexing

Getting the last element used to mean `arr[arr.length - 1]`. `at()` accepts negative indices:

```js
const arr = [10, 20, 30];
arr.at(-1);   // 30
arr.at(-2);   // 20
```

Small, but it reads far better in a chain — `list.filter(...).at(-1)` beats storing the array just to index its length.

## `findLast()` / `findLastIndex()`

`find()` searches front to back. When you want the *last* match, you used to reverse the array (mutating or copying) or write a descending loop. Now:

```js
const nums = [1, 2, 3, 4, 5];
nums.findLast((n) => n % 2 === 0);       // 4
nums.findLastIndex((n) => n % 2 === 0);  // 3
```

No `.slice().reverse().find()` dance, no off-by-one when converting the index back.

## `flatMap()` — map then flatten one level

When each item maps to zero-or-more items, `map` leaves you with nested arrays and a `.flat()` afterward. `flatMap` does both in one pass:

```js
const sentences = ["hello world", "foo bar"];
sentences.flatMap((s) => s.split(" "));
// ["hello", "world", "foo", "bar"]
```

It's also a clean way to map-and-filter at once — return `[]` to drop an item:

```js
const nums = [1, 2, 3, 4];
nums.flatMap((n) => (n % 2 ? [n * 10] : []));
// [10, 30]   ← odds kept and transformed, evens removed
```

## `Object.groupBy()` — bucket by a key

Grouping is one of the most common data tasks, and for years it meant a `reduce` with an accumulator you had to initialize carefully. `Object.groupBy` does it directly:

```js
const people = [
  { name: "Ada", role: "eng" },
  { name: "Bob", role: "design" },
  { name: "Cy", role: "eng" },
];

Object.groupBy(people, (p) => p.role);
// {
//   eng:    [{ name: "Ada", ... }, { name: "Cy", ... }],
//   design: [{ name: "Bob", ... }],
// }
```

Compare that to the reduce it replaces:

```js
people.reduce((acc, p) => {
  (acc[p.role] ??= []).push(p);
  return acc;
}, {});
```

Both work, but one states the intent and the other makes you read it. There's also `Map.groupBy` when your keys aren't strings.

## A note on support

`at`, `findLast`, and `flatMap` are broadly available and safe to use today. `Object.groupBy` / `Map.groupBy` are newer (2024-era) — great in current runtimes, worth a quick check against your target environments or a polyfill for older ones.

The theme across all four: the language is slowly absorbing the patterns we used to hand-roll. Every one of these replaces a loop or a `reduce` that was easy to get subtly wrong — and reads as what you actually meant.
