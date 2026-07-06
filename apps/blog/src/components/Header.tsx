import { Nav, ThemeProvider, ThemeToggle } from "@pv/ui";
import { useLogo } from "@/lib/useLogo";

// The nav itself lives inside ThemeProvider so useLogo/ThemeToggle can read theme
// context — this is the same <Nav> shared with the portfolio app.
function BlogNav() {
  const logo = useLogo();
  return (
    <Nav
      name="Prasanna Vijayan"
      avatarUrl={logo}
      homeHref="https://prasannavijayan.in"
      links={
        <>
          <a className="nav-link" href="https://prasannavijayan.in" title="Home">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </a>
          <a className="nav-link" href="https://prasannavijayan.in/projects" title="Projects">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Projects</span>
          </a>
          <a className="nav-link active" href="/" title="Blog">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Blog</span>
          </a>
        </>
      }
      actions={<ThemeToggle />}
    />
  );
}

export default function Header() {
  return (
    <ThemeProvider>
      <BlogNav />
    </ThemeProvider>
  );
}
