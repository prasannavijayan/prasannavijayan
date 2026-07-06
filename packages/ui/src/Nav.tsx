import { useState } from "react";
import type { ReactNode } from "react";

type NavProps = {
  /** Full name, used as alt/aria text for the logo — no longer rendered as visible text. */
  name: string;
  avatarUrl?: string;
  /** Where the logo links to. Defaults to the site root. */
  homeHref?: string;
  /** Center nav links (Home, Projects, Blog, ...). */
  links?: ReactNode;
  /** Right-side actions, e.g. <ThemeToggle/>. */
  actions?: ReactNode;
};

const NAV_LINK_BASE =
  "relative flex h-full items-center gap-1.5 whitespace-nowrap px-3.5 max-sm:px-2.5 font-google-sans-text text-[13px] font-medium no-underline transition-colors";
const NAV_LINK_ACTIVE =
  "text-text-primary after:absolute after:-bottom-px after:left-3.5 after:right-3.5 max-sm:after:left-2.5 max-sm:after:right-2.5 after:h-0.5 after:bg-accent after:shadow-none after:content-['']";
const NAV_LINK_INACTIVE = "text-text-secondary hover:text-text-primary";

/** Class string for a nav link `<a>`/`<Link>` — centralizes the active-state
 * underline so it isn't hand-copied at every call site. */
export function navLinkClass(active = false): string {
  return `${NAV_LINK_BASE} ${active ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}`;
}

/** Wraps a nav link's text label so it hides on narrow screens, leaving just the icon. */
export function NavLabel({ children }: { children: ReactNode }) {
  return <span className="max-sm:hidden">{children}</span>;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1a73e8] to-[#34a853] font-google-sans text-[13px] font-semibold text-white";
  if (!avatarUrl || failed) {
    return <div className={base}>{initials(name)}</div>;
  }
  return (
    <div className={base}>
      <img className="h-full w-full rounded-full object-cover" src={avatarUrl} alt={name} onError={() => setFailed(true)} />
    </div>
  );
}

export function Nav({ name, avatarUrl, homeHref = "/", links, actions }: NavProps) {
  return (
    <nav className="relative z-10 grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-stretch border-b border-border bg-bg px-5">
      <a className="flex items-center justify-self-start no-underline" href={homeHref} aria-label={name} title={name}>
        <Avatar name={name} avatarUrl={avatarUrl} />
      </a>
      {links && <div className="flex items-stretch justify-self-center gap-1">{links}</div>}
      {actions && <div className="flex items-center justify-self-end gap-1">{actions}</div>}
    </nav>
  );
}
