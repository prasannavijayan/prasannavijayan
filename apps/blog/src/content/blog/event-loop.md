---
title: "The event loop in 4 minutes: micro vs macro"
description: "Why a Promise always beats setTimeout(0), explained with one snippet and no diagrams."
tags: ["javascript", "async"]
status: draft
created: "2026-07-05T17:11:48"
publishedAt: ""
reviewTook: ""
attribution: "AI written, Human reviewed"
---

Here's a question that trips up a lot of experienced developers. What order do these log in?

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

The answer is `1, 4, 3, 2`. If you expected `1, 4, 2, 3`, this post is for you.

## Synchronous first

JavaScript runs your synchronous code top to bottom, uninterrupted. So `1` and `4` print first — nothing async can jump ahead of code that's already running. The `setTimeout` callback and the `.then` callback are both *scheduled*, not run, during this phase.

That leaves the question: after the synchronous code finishes, why does `3` (the Promise) beat `2` (the timeout)?

## Two queues, not one

The event loop doesn't have a single to-do list. It has two, with different priorities:

- **Macrotask queue** — `setTimeout`, `setInterval`, I/O, UI events.
- **Microtask queue** — Promise callbacks (`.then`/`catch`/`finally`), `queueMicrotask`, `await` continuations.

The rule that explains everything: **after each macrotask, the engine drains the *entire* microtask queue before picking up the next macrotask.**

So the timeline is:

1. Run the main script (a macrotask). Logs `1`, `4`. Schedules a macrotask (`2`) and a microtask (`3`).
2. Main script ends → drain microtasks → logs `3`.
3. Microtask queue empty → take the next macrotask → logs `2`.

Promises win not because they're "faster," but because microtasks are emptied completely between macrotasks.

## Why this bites: starving the loop

Because microtasks run to exhaustion, a microtask that schedules another microtask can block everything else — including rendering:

```js
function loop() {
  Promise.resolve().then(loop); // schedules itself, forever
}
loop(); // the page freezes: macrotasks and paint never get a turn
```

The same code with `setTimeout(loop, 0)` would *not* freeze the page, because each iteration is a separate macrotask, and the browser gets to paint and handle events between them.

## `await` is just microtasks

`await` is syntactic sugar over `.then`, so everything after an `await` is a microtask continuation:

```js
async function run() {
  console.log("a");
  await null;          // pause; rest becomes a microtask
  console.log("b");
}
run();
console.log("c");      // logs: a, c, b
```

`console.log("a")` runs synchronously, the `await` yields, `c` prints, then the microtask resumes and prints `b`.

## The one rule to remember

If you remember nothing else: **the microtask queue is fully drained between every macrotask.** That single sentence predicts the output of almost every "what order does this log" puzzle — and explains why a runaway Promise chain can lock up a tab that a runaway `setTimeout` wouldn't.
