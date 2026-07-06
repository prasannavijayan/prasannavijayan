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
  if (!avatarUrl || failed) {
    return <div className="nav-avatar">{initials(name)}</div>;
  }
  return (
    <div className="nav-avatar">
      <img src={avatarUrl} alt={name} onError={() => setFailed(true)} />
    </div>
  );
}

export function Nav({ name, avatarUrl, homeHref = "/", links, actions }: NavProps) {
  return (
    <nav className="topnav">
      <a className="nav-logo" href={homeHref} aria-label={name} title={name}>
        <Avatar name={name} avatarUrl={avatarUrl} />
      </a>
      {links && <div className="nav-links">{links}</div>}
      {actions && <div className="nav-actions">{actions}</div>}
    </nav>
  );
}
