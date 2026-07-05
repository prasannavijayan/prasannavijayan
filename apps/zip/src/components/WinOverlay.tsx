import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/hooks/useTimer";

type WinOverlayProps = {
  levelNumber: number;
  time: number;
  onNextLevel: () => void;
  onBackToMenu: () => void;
  onClose: () => void;
};

export function WinOverlay({
  levelNumber,
  time,
  onNextLevel,
  onBackToMenu,
  onClose,
}: WinOverlayProps) {
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => nextBtnRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  function handleNextLevel() {
    if (isExiting) return;
    setIsExiting(true);

    setTimeout(() => {
      onNextLevel();
    }, 500);
  }

  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 ${
        isExiting ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div
        className={`relative bg-surface border border-slate-600 rounded-2xl p-8 text-center max-w-sm mx-4 ${
          isExiting ? "animate-slide-away" : "animate-slide-to-center"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-muted hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="text-5xl mb-4">&#127881;</div>
        <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
        <p className="text-text-muted mb-1">
          Level {levelNumber} solved
        </p>
        <p className="text-white font-mono tabular-nums text-lg mb-6">
          ⏱ {formatTime(time)}
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
              ref={nextBtnRef}
              onClick={handleNextLevel}
              disabled={isExiting}
              className="px-5 py-2.5 rounded-lg bg-path text-white font-semibold hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-path focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
            >
              Next Level
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
