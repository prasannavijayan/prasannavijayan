import { useState } from "react";
import type { ReactNode } from "react";

type NavProps = {
  /** Full name, e.g. "Prasanna Vijayan". The last word is accent-colored. */
  name: string;
  avatarUrl?: string;
  /** Where the logo links to. Defaults to the site root. */
  homeHref?: string;
  /** Small pill rendered on the left, after the name. */
  chip?: ReactNode;
  /** Right-side actions (links, buttons, <ThemeToggle/>). */
  children?: ReactNode;
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

export function Nav({ name, avatarUrl, homeHref = "/", chip, children }: NavProps) {
  const parts = name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : undefined;
  const first = parts.join(" ");

  return (
    <nav className="topnav">
      <a className="nav-logo" href={homeHref}>
        <Avatar name={name} avatarUrl={avatarUrl} />
        <span className="nav-name">
          {first} {last && <span>{last}</span>}
        </span>
      </a>
      {chip && <div className="nav-chip">{chip}</div>}
      <div className="nav-spacer" />
      {children}
    </nav>
  );
}
