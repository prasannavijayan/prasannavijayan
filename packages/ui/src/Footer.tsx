import type { ReactNode } from "react";

type FooterProps = {
  /** Alt text for the logo. */
  name?: string;
  /** Optional brand logo. */
  logoSrc?: string;
  /** Optional links rendered after the logo (e.g. anchors). */
  children?: ReactNode;
};

// Copyright line dropped for now — logo + links only until we decide what goes here.
export function Footer({ name = "Prasanna Vijayan", logoSrc, children }: FooterProps) {
  return (
    <footer className="site-footer">
      {logoSrc && <img className="site-footer-logo" src={logoSrc} alt={name} />}
      {children && <nav className="site-footer-links">{children}</nav>}
    </footer>
  );
}
