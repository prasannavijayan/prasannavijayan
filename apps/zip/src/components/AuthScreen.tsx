import heroImage from "@/assets/hero.png";

type Props = {
  onSignIn: () => void;
  error?: string | null;
};

function ZipLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="6" fill="#f59e0b" />
      <circle cx="36" cy="12" r="6" fill="#f59e0b" />
      <circle cx="36" cy="36" r="6" fill="#10b981" />
      <circle cx="12" cy="36" r="6" fill="#10b981" />
      <line x1="12" y1="12" x2="36" y2="12" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="12" x2="36" y2="36" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="36" x2="12" y2="36" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GamePreview() {
  const gridSize = 5;
  const path = [
    [0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0],
    [4, 1], [4, 2], [4, 3], [3, 3], [2, 3], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4],
  ];
  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
  const dots: Record<string, number> = {
    "0,0": 1,
    "0,2": 2,
    "2,0": 3,
    "4,0": 4,
    "4,3": 5,
    "1,4": 6,
    "4,4": 7,
  };

  return (
    <div className="relative w-full max-w-[280px] ml-auto mr-0 lg:translate-x-4">
      <div className="absolute -inset-4 bg-[--color-path]/20 blur-2xl rounded-3xl" />
      <div className="relative bg-[--color-surface] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-[--color-text]">Level 42</span>
          <span className="text-xs text-[--color-text-muted] font-mono">01:24</span>
        </div>
        <div
          className="grid gap-0.5 bg-[--color-grid-bg] rounded-lg p-1.5 border border-[--color-grid-border]"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, i) => {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const key = `${row},${col}`;
            const onPath = pathSet.has(key);
            const dot = dots[key];
            const isHead = key === "4,4";

            return (
              <div
                key={key}
                className={`aspect-square rounded-sm flex items-center justify-center relative ${
                  onPath ? "bg-[--color-path-light]/40" : "bg-white"
                } ${isHead ? "ring-2 ring-[--color-path] ring-offset-1 ring-offset-[--color-grid-bg]" : ""}`}
              >
                {dot !== undefined && (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                      dot <= 4 ? "bg-[--color-dot]" : "bg-[--color-dot-connected]"
                    }`}
                  >
                    {dot}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "700+ hand-crafted puzzles",
    description: "From 5×5 grids to 9×8 with walls — difficulty grows as you progress.",
  },
  {
    title: "Sync across devices",
    description: "Sign in once and pick up exactly where you left off, anywhere.",
  },
  {
    title: "Compete on leaderboards",
    description: "Race the clock and climb the ranks on every level.",
  },
];

export function AuthScreen({ onSignIn, error }: Props) {
  return (
    <div className="min-h-[calc(100vh-60px)] w-full flex flex-col lg:flex-row">
      {/* Info + screenshot — left on desktop, below login on mobile */}
      <div className="order-2 lg:order-1 w-full lg:w-1/2 lg:shrink-0 relative overflow-hidden bg-[--color-surface]/50 lg:border-b-0 lg:border-r border-white/10 flex items-center justify-center">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute left-[38%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 lg:w-96 opacity-30 pointer-events-none select-none"
        />
        <div className="relative flex flex-col justify-center w-full max-w-md mx-auto px-8 py-12 lg:px-14 lg:py-16 gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[--color-path] mb-3">
              Puzzle game
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[--color-text] leading-tight tracking-tight">
              Draw one continuous path through every cell
            </h2>
            <p className="text-sm text-[--color-text-muted] mt-3 leading-relaxed">
              Visit numbered dots in order, never cross your own trail, and fill the entire grid to win.
            </p>
          </div>

          <GamePreview />

          <ul className="flex flex-col gap-4">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[--color-path] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[--color-text]">{feature.title}</p>
                  <p className="text-xs text-[--color-text-muted] mt-0.5 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Login — right on desktop, top on mobile */}
      <div className="order-1 lg:order-2 w-full lg:w-1/2 lg:shrink-0 flex items-center justify-center px-6 py-12 lg:px-16 lg:py-0 border-b lg:border-b-0 border-white/10">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[--color-surface] flex items-center justify-center border border-white/10">
              <ZipLogo />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[--color-text] tracking-tight">Zip</h1>
              <p className="text-sm text-[--color-text-muted] mt-1 leading-relaxed">
                Connect the dots. Fill every cell.
              </p>
            </div>
          </div>

          <div className="bg-[--color-surface] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-[--color-text]">Welcome back</p>
              <p className="text-xs text-[--color-text-muted] mt-0.5">
                Sign in to save your progress
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-150"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg p-3">{error}</p>
          )}

          <p className="text-xs text-[--color-text-muted]">
            No account needed to play — sign in only to sync progress.
          </p>
        </div>
      </div>
    </div>
  );
}
