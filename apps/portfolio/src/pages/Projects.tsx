import { Link } from "react-router-dom";
import { Footer, Nav, NavLabel, navLinkClass, ThemeToggle } from "@pv/ui";
import { useLogo } from "@/lib/useLogo";

type Project = {
  name: string;
  url: string;
  iconClass: string;
  icon: React.ReactNode;
  description: string;
  tags: string[];
  cta: string;
};

const arrow = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const projects: Project[] = [
  {
    name: "Zip",
    url: "https://zip.prasannavijayan.in",
    iconClass: "zip",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    description:
      "A path-drawing puzzle game — connect numbered dots in order by drawing a single continuous path that fills every cell on the board. Includes levels, timed play, a leaderboard, and auth.",
    tags: ["React 19", "TypeScript", "Vite", "Tailwind", "Firebase", "PWA"],
    cta: "Play now",
  },
  {
    name: "SpendAnalyser",
    url: "https://fincorp.prasannavijayan.in",
    iconClass: "fincorp",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    description:
      "A personal expense tracker powered by WhatsApp. Text an expense → it's auto-categorised → view monthly spending breakdowns on a responsive dashboard with pie/bar charts and an itemised table.",
    tags: ["React 18", "Django REST", "Recharts", "Twilio WhatsApp", "PostgreSQL", "Vercel", "Supabase"],
    cta: "View dashboard",
  },
];

export default function Projects() {
  const logo = useLogo();
  return (
    <>
      <Nav
        name="Prasanna Vijayan"
        avatarUrl={logo}
        links={
          <>
            <Link className={navLinkClass()} to="/" title="Home">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <NavLabel>Home</NavLabel>
            </Link>
            <Link className={navLinkClass(true)} to="/projects" title="Projects">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <NavLabel>Projects</NavLabel>
            </Link>
            <a className={navLinkClass()} href="https://blog.prasannavijayan.in" title="Blog">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <NavLabel>Blog</NavLabel>
            </a>
          </>
        }
        actions={<ThemeToggle />}
      />

      <div className="page">
        <div className="page-inner">
          <div className="page-header">
            <h1 className="page-title">Projects</h1>
            <p className="page-sub">A few things I've built for fun and for real — live and playable.</p>
          </div>

          <div className="project-grid">
            {projects.map((p) => (
              <a
                key={p.name}
                className="project-card"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="project-top">
                  <div className={`project-icon ${p.iconClass}`}>{p.icon}</div>
                  <div className="project-heading">
                    <span className="project-name">{p.name}</span>
                    <span className="project-url">{p.url.replace("https://", "")}</span>
                  </div>
                </div>
                <p className="project-desc">{p.description}</p>
                <div className="project-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="project-tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="project-cta">
                  {p.cta}
                  {arrow}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer variant="portfolio" blogUrl="https://blog.prasannavijayan.in" />
    </>
  );
}
