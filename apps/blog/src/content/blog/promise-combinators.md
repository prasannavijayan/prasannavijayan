---
title: "all, allSettled, race, any: pick the right one"
description: "Four Promise combinators, four failure modes. Choosing wrong means one bad request sinks the rest."
tags: ["javascript", "async"]
status: draft
created: "2026-07-05T17:45:33"
publishedAt: ""
reviewTook: ""
attribution: "AI written, Human reviewed"
---

JavaScript has four ways to combine promises, and they differ entirely in how they treat failure. Pick the wrong one and a single slow or failing request breaks a screen it shouldn't.

Say we have three requests:

```js
const requests = [fetchUser(), fetchPosts(), fetchAds()];
```

## `Promise.all` — all or nothing

Resolves with an array of all results, in order — but **rejects the moment any one rejects**:

```js
const [user, posts, ads] = await Promise.all(requests);
```

Use it when you genuinely need every result to proceed. The trap: if `fetchAds()` fails, you lose the user and posts too, even though they succeeded. Great for "load the three things this page can't render without"; wrong for "load these three independent widgets."

## `Promise.allSettled` — never rejects

Waits for every promise and reports each outcome as `{ status, value }` or `{ status, reason }`. It never rejects:

```js
const results = await Promise.allSettled(requests);

results.forEach((r) => {
  if (r.status === "fulfilled") render(r.value);
  else showError(r.reason);
});
```

This is the right tool for **independent** work — a dashboard of widgets where each should render or fail on its own. One failed request degrades one widget, not the page.

## `Promise.race` — first to settle wins

Settles as soon as *any* promise settles — whether it fulfills **or rejects**:

```js
const result = await Promise.race([
  fetchData(),
  timeout(5000), // rejects after 5s
]);
```

The classic use is a timeout: race real work against a promise that rejects after N ms. Because a rejection also "wins" the race, this correctly bails out when the timeout fires first.

## `Promise.any` — first *success* wins

Settles with the first promise that **fulfills**, ignoring rejections. It only rejects if *all* fail (with an `AggregateError`):

```js
try {
  const fastest = await Promise.any([
    fetch("https://mirror-1/data"),
    fetch("https://mirror-2/data"),
    fetch("https://mirror-3/data"),
  ]);
} catch (err) {
  // err is an AggregateError — every mirror failed
  console.log(err.errors);
}
```

Perfect for redundancy: hit several mirrors, take whichever answers first, and only error if they all die.

## The cheat sheet

| Combinator | Resolves when | Rejects when |
|---|---|---|
| `all` | all fulfill | any rejects |
| `allSettled` | all settle | never |
| `race` | first settles | first settles with a rejection |
| `any` | first fulfills | all reject |

Two questions pick the right one: **do I need every result, or just some?** and **should one failure fail the whole thing?** If failures are independent, `allSettled` is almost always what you want — and it's the one people reach for least. Reserve `all` for the cases where a partial result is genuinely useless.
