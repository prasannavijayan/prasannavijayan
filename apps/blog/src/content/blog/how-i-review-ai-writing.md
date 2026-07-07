---
title: "How I Review the Posts an AI Writes"
description: "The badge says 'AI written, Human reviewed.' Here's what the review actually involves."
tags: ["meta", "workflow"]
status: draft
created: "2026-07-07T03:07:07"
publishedAt: ""
timeToPublish: ""
attribution: "AI written, Human reviewed"
pinned: true
quirks:
  - "Ran every code snippet myself before it shipped"
  - "Checked every API claim against current docs, not the model's training-era memory"
  - "Cut an invented statistic I couldn't verify"
  - "Rewrote anything that slipped into corporate-blog voice"
  - "Confirmed version numbers weren't already stale"
  - "Argued with the draft in at least one place, in writing"
  - "Clicked every link before publishing"
  - "Trimmed padding the draft added just to hit a word count"
  - "Added the one anecdote only I could know"
  - "Deleted the fake-summary conclusion the draft tacked on"
  - "The review timer was running the entire time — see the badge above"
---

Every post on this blog carries a small badge: "AI written, Human reviewed." It's an honest label, but on its own it's also a cheap one — anyone can put those four words on anything. The badge doesn't tell you what "reviewed" means, and "reviewed" is doing all the work in that sentence.

So here's what it actually means, on this blog, for this post included.

## The workflow, not the vibes

Every post starts as a Markdown file with `status: draft` and a `created` timestamp. Nothing with that status renders in production — it only shows up locally, in a dev-only "draft reading mode," flagged with an orange Draft badge so I never mistake a draft for something live.

Review happens against that draft. When it's done, I flip `status` to `published` by hand, and a pre-commit hook stamps `publishedAt` and computes `timeToPublish` — the gap between drafting and publishing.

`timeToPublish` used to be the only number this blog tracked, and it's a weak one. A post can sit drafted for three days while I'm busy with other things, then get a five-minute skim before publishing — `timeToPublish` would say "3 days" and imply a thoroughness that never happened. So the real metric is `reviewTook`: actual, timed review effort, captured by a dev toolbar timer I start when I begin reviewing and stop when I'm done. That's the number the badge prefers when it's available, and it's the number that puts a blue checkmark next to the badge — not "published," which just means a status field got flipped, but "timed review happened," which is a stronger claim.

## What the timer is actually running for

A handful of things, concretely, not "I read it carefully":

Every code snippet gets run, not eyeballed — if it's ````js`, it executed on my machine before it shipped. Claims about how an API or library behaves get checked against current docs, because a model's sense of "current" is frozen at training time and libraries don't hold still. Numbers get scrutinized the same way: version claims, dates, anything that could quietly go stale get confirmed, not assumed.

Anything invented gets cut. A draft handing me a suspiciously tidy statistic with no source is a draft I don't trust, so if I can't verify it, it doesn't survive review. Same with the writing itself — the tell-tale corporate-blog cadence ("in today's fast-paced world," padding sentences that exist to hit a length rather than say something) gets rewritten or removed, and the fake-summary conclusion that just restates the intro gets deleted outright.

And at least once per post, I push back on the draft in writing — a place where I think it's wrong, or where I'd say it differently, and I say so rather than silently editing around it. I also add something the model couldn't have: a real anecdote, an opinion it has no way of holding. Links get clicked, not assumed to resolve.

## The proof is on this page

This post is the easiest one to check, because it's checking itself. Look at the badge above this section — if `reviewTook` is filled in, that blue tick means a timer really ran while I did the things on this page, not a title I'm claiming for free. Below this post, there's a checklist of what specifically happened during review, in an order that gets reshuffled per post so it doesn't read as a copy-pasted disclaimer — because that's what it is, a checklist, and it should look like one, not like decoration.

Here's what that actually looks like while it's running — the same dev-only toolbar, on this same post, mid-review:

![The Review Timer dev toolbar running on this post, showing 00:04 elapsed and a "Review completed" button](/review-timer.png)

## Why bother formalizing this

Because "trust me" doesn't scale, and because I'd rather build the infrastructure once than repeat the argument on every post. The provenance system — the draft/publish gate, the timer, the badge, this checklist — is deliberately built as reusable pieces (`src/lib/provenance.ts`, the `<Provenance>` badge, the git hook) rather than a one-off for this post. The plan is to dogfood it here for a couple of weeks, then pull it out into a standalone Astro integration, `astro-provenance`, so the interesting part — proving review actually happened, not just claiming it — isn't locked to this one blog.
