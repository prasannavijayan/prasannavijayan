# @pv/ui

Shared React components for prasannavijayan.in — the site chrome that every app
renders the same way.

Planned components:

- `Nav` — top navigation bar (avatar, name, role pill, links)
- `ThemeToggle` — dark/light switch (currently duplicated in portfolio + blog)
- `Card`, `Button`, `Pill` — primitives styled from `@pv/tokens`

> **Status:** placeholder. Components land here in **Phase 2**, when the portfolio
> is converted to React. The Astro blog consumes them as islands; the React
> portfolio imports them directly. Until then, `@pv/tokens` already provides the
> shared color/spacing variables.
