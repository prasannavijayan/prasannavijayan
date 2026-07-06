// Rendered as the Nav `chip` — stays identical on every route so switching
// pages doesn't reflow/flicker the header (Resume used to live in the
// right-side nav-links, which differ in width per page).
export function RoleChip({ onResumeClick }: { onResumeClick: () => void }) {
  return (
    <>
      <span className="chip-role-text">AI Frontend Engineer · 10+ yrs</span>
      <button type="button" className="chip-resume-btn" onClick={onResumeClick}>
        Resume
      </button>
    </>
  );
}
