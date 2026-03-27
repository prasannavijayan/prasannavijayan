import { useState } from "react";

type LevelSelectProps = {
  onSelectLevel: (levelNumber: number) => void;
  onSignOut?: () => void;
  userEmail?: string;
  currentLevel: number;
};

const LEVELS_PER_PAGE = 50;
const TOTAL_LEVELS = 500;
const TOTAL_PAGES = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);

function getTierColor(level: number): string {
  if (level <= 100) return "bg-emerald-600 hover:bg-emerald-500";
  if (level <= 250) return "bg-blue-600 hover:bg-blue-500";
  if (level <= 400) return "bg-orange-600 hover:bg-orange-500";
  return "bg-red-600 hover:bg-red-500";
}

function getTierLabel(page: number): string {
  const start = page * LEVELS_PER_PAGE + 1;
  if (start <= 100) return "5x5 Easy";
  if (start <= 250) return "6x6 Medium";
  if (start <= 400) return "7x7 Hard";
  return "8x8 Expert";
}

export function LevelSelect({ onSelectLevel, onSignOut, userEmail, currentLevel }: LevelSelectProps) {
  const [page, setPage] = useState(0);

  const startLevel = page * LEVELS_PER_PAGE + 1;
  const endLevel = Math.min(startLevel + LEVELS_PER_PAGE - 1, TOTAL_LEVELS);

  const levels = [];
  for (let i = startLevel; i <= endLevel; i++) {
    levels.push(i);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-bg p-4">
      <div className="w-full max-w-md flex items-center justify-between mt-8 mb-2">
        <h1 className="text-3xl font-bold text-white">Zip</h1>
        {onSignOut && (
          <button
            onClick={onSignOut}
            title={userEmail}
            className="text-xs text-[--color-text-muted] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            Sign out
          </button>
        )}
      </div>
      <p className="text-text-muted mb-6">Connect the dots. Fill every cell.</p>

      <div className="text-sm text-text-muted mb-4">
        {Math.max(0, currentLevel - 1)} / {TOTAL_LEVELS} completed
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1.5 rounded bg-slate-700 text-white text-sm disabled:opacity-30 hover:bg-slate-600 transition-colors"
        >
          &larr;
        </button>
        <span className="text-white text-sm font-medium">
          {getTierLabel(page)} &middot; {startLevel}-{endLevel}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1))}
          disabled={page === TOTAL_PAGES - 1}
          className="px-3 py-1.5 rounded bg-slate-700 text-white text-sm disabled:opacity-30 hover:bg-slate-600 transition-colors"
        >
          &rarr;
        </button>
      </div>

      {/* Level grid */}
      <div className="grid grid-cols-10 gap-2 max-w-md w-full">
        {levels.map((level) => {
          const isCompleted = level < currentLevel;
          const isUnlocked = level <= currentLevel;
          return (
            <button
              key={level}
              onClick={() => isUnlocked && onSelectLevel(level)}
              disabled={!isUnlocked}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg
                text-white text-xs font-semibold transition-all
                ${!isUnlocked
                  ? "bg-slate-800 opacity-40 cursor-not-allowed"
                  : isCompleted
                    ? "bg-slate-600 opacity-70"
                    : getTierColor(level)
                }
              `}
            >
              {isUnlocked ? level : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-50">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
              )}
              {isCompleted && (
                <span className="absolute -top-1 -right-1 text-[10px] text-emerald-400">
                  &#10003;
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
