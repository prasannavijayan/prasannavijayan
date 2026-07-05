import type { ReactNode } from "react";

type FooterProps = {
  /** Name shown in the copyright line. */
  name?: string;
  /** Copyright year. Defaults to the current year. */
  year?: number;
  /** Optional brand logo shown before the copyright text. */
  logoSrc?: string;
  /** Optional links rendered after the copyright (e.g. anchors). */
  children?: ReactNode;
};

export function Footer({
  name = "Prasanna Vijayan",
  year = new Date().getFullYear(),
  logoSrc,
  children,
}: FooterProps) {
  return (
    <footer className="site-footer">
      {logoSrc && <img className="site-footer-logo" src={logoSrc} alt={name} />}
      <span className="site-footer-copy">
        © {year} {name}
      </span>
      {children && <nav className="site-footer-links">{children}</nav>}
    </footer>
  );
}
