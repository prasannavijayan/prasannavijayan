---
title: "The Intl API killed your date library"
description: "Locale-aware dates, currency, plurals, and '3 hours ago' — built into the browser, zero dependencies."
tags: ["javascript", "i18n"]
status: draft
created: "2026-07-05T17:39:55"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
reviewStartedAt: "2026-07-05T21:41:32"
reviewCompletedAt: "2026-07-05T21:46:45"
reviewTook: "5 minutes"
---

Reach for a formatting library and you often pull in kilobytes to do things the platform already does. The `Intl` namespace is built into every modern runtime and handles locale-aware formatting for free.

## Dates and times

`Intl.DateTimeFormat` formats a `Date` for a locale, with granular control:

```js
const d = new Date("2026-07-05T14:30:00");

new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
}).format(d);
// "5 July 2026 at 14:30"

new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(d);
// "July 5, 2026"
```

No format-string cheat sheet (`YYYY-MM-DD`), no locale data to bundle. Ask for a *style* and each locale formats itself correctly.

## Numbers and currency

`Intl.NumberFormat` covers thousands separators, decimals, percentages, and currency — with the right symbol and placement per locale:

```js
new Intl.NumberFormat("en-IN").format(1234567.89);
// "12,34,567.89"   ← note the Indian grouping

new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(1999.5);
// "$1,999.50"

new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
}).format(1999.5);
// "1.999,50 €"
```

## "3 hours ago" without a library

Relative time is the feature people install a whole dependency for. It's built in:

```js
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

rtf.format(-1, "day");    // "yesterday"
rtf.format(-3, "hour");   // "3 hours ago"
rtf.format(2, "week");    // "in 2 weeks"
```

Pair it with a tiny helper that picks the right unit:

```js
function timeAgo(date) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const seconds = (date.getTime() - Date.now()) / 1000;
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60], ["second", 1],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs || unit === "second") {
      return rtf.format(Math.round(seconds / secs), unit);
    }
  }
}

const now = Date.now();

timeAgo(new Date(now - 86400 * 1000));        // "yesterday"
timeAgo(new Date(now - 2 * 3600 * 1000));     // "2 hours ago"
timeAgo(new Date(now - 5 * 60 * 1000));        // "5 minutes ago"
timeAgo(new Date(now + 3 * 86400 * 1000));    // "in 3 days"
timeAgo(new Date(now - 45 * 1000));           // "45 seconds ago"
```

## Plurals and lists

Two more that quietly remove branching:

```js
const pr = new Intl.PluralRules("en");
pr.select(1);   // "one"
pr.select(5);   // "other"   → pick "item" vs "items" correctly

new Intl.ListFormat("en", { style: "long", type: "conjunction" })
  .format(["React", "Vue", "Svelte"]);
// "React, Vue, and Svelte"
```

## The one tip that saves performance

Constructing an `Intl.*` formatter isn't free. If you format in a loop or a hot render path, **create the formatter once and reuse it** rather than newing it up per call:

```js
// ❌ slow — new formatter on every iteration
rows.forEach((r) => {
  render(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(r.total));
});

// ✅ create once, reuse
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const rows = [{ total: 19.99 }, { total: 249.5 }, { total: 1200 }];

rows.map((r) => money.format(r.total));
// ["$19.99", "$249.50", "$1,200.00"]

// same idea for dates in a list
const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const events = [
  { name: "Shipped", at: new Date("2026-07-01") },
  { name: "Delivered", at: new Date("2026-07-05") },
];

events.map((e) => `${e.name}: ${dateFmt.format(e.at)}`);
// ["Shipped: Jul 1, 2026", "Delivered: Jul 5, 2026"]
```

The takeaway: before installing a date or number library, check whether `Intl` already does it. For formatting — dates, currency, relative time, plurals, lists — it almost always does, in every locale, with nothing to ship.
