import { useEffect } from "react";

export function ResumeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm transition-opacity duration-200 max-sm:p-0 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`flex h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-transform duration-200 max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <span className="flex items-center gap-2 font-google-sans-text text-sm font-medium text-text-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Prasanna_Vijayan_Resume.pdf
          </span>
          <div className="flex items-center gap-2">
            <a
              className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 font-google-sans-text text-xs font-medium text-accent-text no-underline transition-colors hover:border-accent hover:bg-accent-light"
              href="/Resume.pdf"
              download="Prasanna_Vijayan_Resume.pdf"
              title="Download"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
            <button
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-none bg-transparent text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              onClick={onClose}
              title="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {open && <iframe className="block h-full w-full border-none" src="/Resume.pdf" title="Resume" />}
        </div>
      </div>
    </div>
  );
}
