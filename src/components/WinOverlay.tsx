type WinOverlayProps = {
  levelNumber: number;
  onNextLevel: () => void;
  onBackToMenu: () => void;
};

export function WinOverlay({
  levelNumber,
  onNextLevel,
  onBackToMenu,
}: WinOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface border border-slate-600 rounded-2xl p-8 text-center max-w-sm mx-4 animate-scale-in">
        <div className="text-5xl mb-4">&#127881;</div>
        <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
        <p className="text-text-muted mb-6">
          Level {levelNumber} solved
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBackToMenu}
            className="px-5 py-2.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
          >
            Menu
          </button>
          {levelNumber < 500 && (
            <button
              onClick={onNextLevel}
              className="px-5 py-2.5 rounded-lg bg-path text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Next Level
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
