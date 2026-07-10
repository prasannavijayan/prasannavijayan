---
title: "Memory leaks in React: build one, then fix it"
description: "The easiest way to understand a memory leak is to make one on purpose. We build a leaking React component, watch it misbehave, fix it in one line, then list the usual suspects."
tags: ["react", "javascript", "memory", "debugging"]
status: "published"
created: "2026-07-05T17:34:10"
publishedAt: "2026-07-10T20:56:19"
timeToPublish: "5 days"
attribution: "AI Written, Human reviewed"
reviewStartedAt: "2026-07-10T20:55:18"
reviewCompletedAt: "2026-07-10T21:02:19"
reviewTook: "7 minutes"
---

"Memory leak" sounds scary, but the idea is simple: your app keeps something running, or holds onto something, after it's done with it. In React it almost always happens the same way — you *start* something inside a component (a timer, a listener, a data subscription) and never *stop* it when the component goes away.

The fastest way to understand it is to build one on purpose, watch it misbehave, and then fix it. Once you've seen the shape of the bug, you'll spot it everywhere.

To follow along, drop the code into a React app — a sandbox like StackBlitz, or a project you already have. (The plain-JS pieces, like `setInterval`, also run on their own in a browser console or <a href="#readme" aria-label="What is a REPL?">Node REPL<sup>*</sup></a>.)

## 🧪 Build a leak on purpose

We'll make a `Clock` that ticks every second, and a button that shows or hides it.

```jsx
import { useState, useEffect } from "react";

function Clock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Start a timer that updates the clock every second.
    setInterval(() => {
      console.log("tick"); // watch this in the console
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    // ⚠️ Notice: we never stop the timer.
  }, []);

  return <p>The time is {time}</p>;
}

export default function App() {
  const [show, setShow] = useState(true);

  return (
    <div>
      <button onClick={() => setShow(!show)}>
        {show ? "Hide" : "Show"} clock
      </button>
      {show && <Clock />}
    </div>
  );
}
```

Run it and open the console. It logs `tick` once a second — fine so far. Now click **Hide clock**. The clock disappears from the screen… but the console *keeps logging* `tick`. Click **Show** and **Hide** a few more times and watch closely: every time the clock appears, a brand-new timer starts, and hiding it never stops the old ones. Soon you've got five, ten, twenty timers all firing at once.

That's the leak. The `Clock` is gone from the page, but the timer it started is still running — still holding onto the component's `setTime` function, still doing work nobody asked for. In a real app you'll also see React warn about updating state on a component that's no longer there, and if you watch the **Memory** tab in DevTools, usage climbs and never comes back down.

## 🤔 Why it happens

`useEffect` runs your code when the component appears. But *starting* a timer is only half the job — someone has to *stop* it when the component leaves. React won't do that for you, because it has no idea what you started or how to undo it. That part is your job, and it's exactly what an effect's **cleanup function** is for.

## 🔧 The fix (one line)

`useEffect` lets you `return` a function. React runs it right before the component unmounts (and before the effect ever re-runs). Return the cleanup that stops whatever you started:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000);

  return () => clearInterval(id); // 👈 stop the timer when the clock leaves
}, []);
```

Now hide the clock and the console goes quiet. Show and hide it twenty times and there's still only ever *one* timer running. The rule underneath is worth memorizing:

> **Anything you start in an effect, stop in its cleanup.**

Started a timer? Clear it. Added a listener? Remove it. Opened a subscription? Close it.

## 📋 The usual suspects

The timer is the classic, but the same "started something, forgot to stop it" shape shows up in a handful of predictable places. Here's each one with its cleanup:

**⏱️ Timers** — `setInterval` / `setTimeout`:

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

**👂 Event listeners** — anything you `addEventListener` on `window`, `document`, or another element:

```jsx
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
```

**📡 Subscriptions** — WebSockets, event emitters, store listeners:

```jsx
useEffect(() => {
  const socket = new WebSocket(url);
  socket.onmessage = handleMessage;
  return () => socket.close();
}, [url]);
```

**🌐 Async work that finishes after you leave** — a `fetch` that resolves *after* the component unmounted, then tries to `setState`:

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch(() => {}); // ignore the abort error
  return () => controller.abort(); // cancel the in-flight request
}, [url]);
```

Same story every time: the effect starts something with a lifetime, and the cleanup ends it. If you can see what an effect *starts*, you can always see what its cleanup should *stop*.

## 🎯 The takeaway

A memory leak in React is almost never mysterious. It's a timer, a listener, a subscription, or a request that outlived the component that started it. And the fix is the same in every case: **return a cleanup function from `useEffect` that undoes whatever the effect did.**

Build the leaking `Clock` once, watch the console keep ticking after it's gone, and you won't forget the cleanup again — which is the whole point of making one on purpose.

-----
<span id="readme"></span>

R - READ | Takes your JavaScript input, parses it, and stores it in memory.

E - Eval | Evaluates and executes the data structure or logic.

P - Prints | Prints the final evaluated result directly to your screen.

L - Loop | Loops the entire process back to the start, waiting for your next input
