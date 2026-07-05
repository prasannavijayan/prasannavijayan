import { useEffect, useRef } from "react";

type LevelSelectProps = {
  onSelectLevel: (levelNumber: number) => void;
  onSignOut?: () => void;
  userEmail?: string;
  currentLevel: number;
};

const TOTAL_LEVELS = 900;
const VISIBLE_AHEAD = 10;

function getTierColor(level: number): string {
  // Original tiers (no walls)
  if (level <= 100) return "bg-emerald-600 hover:bg-emerald-500"; // 5×5
  if (level <= 250) return "bg-blue-600 hover:bg-blue-500";       // 6×6
  if (level <= 400) return "bg-orange-600 hover:bg-orange-500";   // 7×7
  if (level <= 500) return "bg-red-600 hover:bg-red-500";         // 8×8
  // Wall tiers
  if (level <= 600) return "bg-purple-600 hover:bg-purple-500";   // 6×6 + walls
  if (level <= 700) return "bg-violet-600 hover:bg-violet-500";   // 7×7 + walls
  if (level <= 800) return "bg-rose-600 hover:bg-rose-500";       // 8×8 + walls
  return "bg-fuchsia-600 hover:bg-fuchsia-500";                   // 9×8 + walls
}

export function LevelSelect({ onSelectLevel, onSignOut, userEmail, currentLevel }: LevelSelectProps) {
  const currentLevelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentLevelRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [currentLevel]);

  // Always show exactly 10 tiles: completed levels + locked levels to fill 2x5
  const maxVisible = Math.min(
    Math.ceil((currentLevel + VISIBLE_AHEAD - 1) / VISIBLE_AHEAD) * VISIBLE_AHEAD,
    TOTAL_LEVELS
  );
  const visibleLevels = Array.from({ length: maxVisible }, (_, i) => i + 1);
  const hiddenCount = TOTAL_LEVELS - maxVisible;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Zip</h1>
            <p className="text-text-muted text-xs">Connect the dots. Fill every cell.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-xs">
              {Math.max(0, currentLevel - 1)}/{TOTAL_LEVELS}
            </span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                title={userEmail}
                className="text-xs text-text-muted hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        {/* Scrollable 2-column level grid */}
        <div className="max-h-[60vh] overflow-y-auto pb-4">
        <div className="grid grid-cols-2 gap-2">
          {visibleLevels.map((level) => {
            const isCompleted = level < currentLevel;
            const isUnlocked = level <= currentLevel;

            return (
              <button
                key={level}
                ref={level === currentLevel ? currentLevelRef : undefined}
                onClick={() => isUnlocked && onSelectLevel(level)}
                disabled={!isUnlocked}
                className={`
                  relative flex items-center justify-between px-4 py-3 rounded-xl
                  text-white text-sm font-semibold transition-all
                  ${!isUnlocked
                    ? "bg-slate-800/60 opacity-40 cursor-not-allowed"
                    : isCompleted
                      ? "bg-slate-700/80 hover:bg-slate-600"
                      : getTierColor(level)
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {!isUnlocked && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-50 shrink-0">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                    </svg>
                  )}
                  Level {level}
                </span>
                {isCompleted && (
                  <span className="text-emerald-400 text-xs">✓</span>
                )}
                {isUnlocked && !isCompleted && (
                  <span className="text-white/60 text-xs">→</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hidden levels message */}
        {hiddenCount > 0 && (
          <div className="mt-6 text-center py-6 border border-dashed border-slate-700 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 mx-auto mb-2 text-slate-600">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
            </svg>
            <p className="text-text-muted text-sm font-medium">
              {hiddenCount} more levels to unlock
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Keep playing to reveal new levels
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
