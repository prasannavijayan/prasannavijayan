type ControlsProps = {
  levelNumber: number;
  onReset: () => void;
  onBack: () => void;
  onLeaderboard: () => void;
};

export function Controls({
  levelNumber,
  onReset,
  onBack,
  onLeaderboard,
}: ControlsProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
        >
          &larr; Menu
        </button>
        <div className="text-center">
          <div className="text-white font-semibold">Level {levelNumber}</div>
          <div className="hidden md:block text-text-muted text-xs">
            Arrow keys to move
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
        >
          Reset
        </button>
      </div>
      <button
        onClick={onLeaderboard}
        className="w-full py-2 rounded-lg bg-slate-700/60 text-text-muted text-sm hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        🏆 Leaderboard
      </button>
    </div>
  );
}
