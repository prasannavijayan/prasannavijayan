type ControlsProps = {
  levelNumber: number;
  gridSize: number;
  pathLength: number;
  totalCells: number;
  onReset: () => void;
  onBack: () => void;
};

export function Controls({
  levelNumber,
  gridSize,
  pathLength,
  totalCells,
  onReset,
  onBack,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mt-4">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
      >
        &larr; Menu
      </button>
      <div className="text-center">
        <div className="text-white font-semibold">Level {levelNumber}</div>
        <div className="text-text-muted text-xs">
          {gridSize}x{gridSize} &middot; {pathLength}/{totalCells}
        </div>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
