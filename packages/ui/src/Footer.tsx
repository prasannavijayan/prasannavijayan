import { useState } from "react";
import { FooterMandala } from "./FooterMandala";
import { ResumeModal } from "./ResumeModal";

type FooterProps = {
  name?: string;
  roleChip?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  tagline?: string;
  year?: number;
  /** Which decorative illustration to show — matches the site this footer lives on. */
  variant?: "portfolio" | "blog";
  /** Shown below the Contact us button when set (blog only). */
  rssUrl?: string;
  /** Shown below the Contact us button when set (portfolio only). */
  blogUrl?: string;
};

const copyrightSVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M14.83 9a4 4 0 1 0 0 6" />
  </svg>
);

const mailSVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const downloadSVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const rssSVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" />
  </svg>
);

const blogSVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const linkedinSVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.37 4.26 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56z" />
  </svg>
);

const githubSVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.41-5.26 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

/** A faint isometric "tile" watermark, styled after zip's hero illustration —
 * the glyph inside the outlined card changes per app so each site gets its own mark. */
function FooterIllustration({ variant }: { variant: "portfolio" | "blog" }) {
  const glyph =
    variant === "blog" ? (
      <g className="stroke-surface" strokeWidth="3" strokeLinecap="round">
        <line x1="72" y1="82" x2="128" y2="82" />
        <line x1="72" y1="100" x2="128" y2="100" />
        <line x1="72" y1="118" x2="108" y2="118" />
      </g>
    ) : (
      <g className="stroke-surface" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="86,84 70,100 86,116" fill="none" />
        <polyline points="114,84 130,100 114,116" fill="none" />
      </g>
    );

  return (
    <svg
      className="pointer-events-none absolute -bottom-[120px] -right-5 z-0 h-[440px] w-[440px] opacity-[0.08]"
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`footer-tile-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-light)" />
        </linearGradient>
      </defs>
      <rect x="30" y="30" width="140" height="140" rx="28" className="stroke-border" fill="none" strokeWidth="2" />
      <rect x="46" y="46" width="140" height="140" rx="28" fill={`url(#footer-tile-${variant})`} />
      <g transform="translate(16 16)">{glyph}</g>
    </svg>
  );
}

export function Footer({
  name = "Prasanna Vijayan",
  roleChip = "Frontend Engineer evolving into <br/> AI-Native Full-Stack Engineer · 10+ yrs",
  email = "prasannavijayan.tm@gmail.com",
  linkedinUrl = "https://linkedin.com/in/prasannavijayan",
  githubUrl = "https://github.com/prasannavijayan",
  tagline = "One step at a time.",
  year = new Date().getFullYear(),
  variant = "portfolio",
  rssUrl,
  blogUrl,
}: FooterProps) {
  const [resumeOpen, setResumeOpen] = useState(false);

  const linkClass = "flex items-center gap-1.5 text-accent-text no-underline hover:underline";

  return (
    <>
      <footer className="relative z-0 grid min-h-[260px] grid-cols-[1fr_auto_1fr] items-center gap-4 overflow-hidden border-t border-border px-12 py-10 font-google-sans-text text-sm text-text-tertiary max-[700px]:grid-cols-1 max-[700px]:justify-items-center max-[700px]:gap-7 max-[700px]:text-center">
        <FooterMandala variant="rings" className="-left-[60px] -top-[60px] h-[200px] w-[200px]" />
        <FooterMandala variant="bloom" className="-top-[90px] right-[15%] h-[140px] w-[140px] max-[700px]:hidden" />
        <FooterMandala variant="star" className="-bottom-[110px] left-[42%] h-[170px] w-[170px] max-[700px]:hidden" />
        <FooterIllustration variant={variant} />

        <div className="relative z-10 flex flex-col justify-self-start gap-2.5 leading-[1.3] max-[700px]:items-center max-[700px]:justify-self-center">
          <div className="flex flex-col leading-[1.3]">
            <span className="text-[15px] font-medium text-text-primary">{name}</span>
            <span className="text-[13px] text-text-tertiary" dangerouslySetInnerHTML={{ __html: roleChip }} />
          </div>
          <div className="flex items-center gap-[5px]">
            Copyright
            {copyrightSVG}
            {year}
          </div>
          <span className="italic text-text-tertiary">{tagline}</span>
        </div>

        <nav className="relative z-10 flex flex-col items-start justify-self-center gap-4 max-[700px]:items-center max-[700px]:justify-self-center">
          <a className={linkClass} href={linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn">
            {linkedinSVG}
            <span>LinkedIn</span>
          </a>
          <a className={linkClass} href={githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
            {githubSVG}
            <span>GitHub</span>
          </a>
          <button
            type="button"
            className="flex items-center gap-1.5 border-none bg-transparent p-0 m-0 [font:inherit] text-accent-text cursor-pointer hover:underline"
            onClick={() => setResumeOpen(true)}
          >
            {downloadSVG}
            <span>Resume</span>
          </button>
        </nav>

        <div className="relative z-10 flex flex-col items-center justify-self-end gap-2.5 max-[700px]:justify-self-center">
          <a
            className="flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 font-medium text-accent-text no-underline transition-all duration-150 hover:border-accent hover:bg-accent-light hover:no-underline"
            href={`mailto:${email}`}
          >
            {mailSVG}
            <span>Contact us</span>
          </a>
          {rssUrl && (
            <a className={linkClass} href={rssUrl} title="RSS feed" aria-label="RSS feed">
              {rssSVG}
              <span>RSS feed</span>
            </a>
          )}
          {blogUrl && (
            <a className={linkClass} href={blogUrl}>
              {blogSVG}
              <span>Blog</span>
            </a>
          )}
        </div>
      </footer>

      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
