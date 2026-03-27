import { useEffect, useState, useRef } from "react";
import type { Level } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { useTimer, formatTime } from "@/hooks/useTimer";
import { useSubmitScore } from "@/hooks/useLeaderboard";
import { markLevelCompleted } from "@/utils/progress";
import { Board } from "@/components/Board";
import { Controls } from "@/components/Controls";
import { WinOverlay } from "@/components/WinOverlay";
import { Leaderboard } from "@/components/Leaderboard";

type GameProps = {
  level: Level;
  uid: string;
  displayName: string;
  userEmail?: string;
  onBack: () => void;
  onNextLevel: () => void;
  onSignOut: () => void;
};

type TransitionPhase = "idle" | "exit" | "enter";

export function Game({ level, uid, displayName, userEmail, onBack, onNextLevel, onSignOut }: GameProps) {
  const [state, dispatch] = useGameState(level);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [transition, setTransition] = useState<TransitionPhase>("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const pendingNextLevel = useRef(false);
  const scoreSubmitted = useRef(false);

  // Timer pauses when level is complete
  const elapsed = useTimer(state.isComplete);

  const { mutate: submitScore } = useSubmitScore();

  // When level prop changes, select the new level and play enter animation
  useEffect(() => {
    if (state.level.levelNumber !== level.levelNumber) {
      dispatch({ type: "SELECT_LEVEL", levelNumber: level.levelNumber });
      setShowOverlay(false);
      setIsCelebrating(false);
      scoreSubmitted.current = false;

      // Play enter animation for the new level
      setTransition("enter");
      const timer = setTimeout(() => setTransition("idle"), 400);
      return () => clearTimeout(timer);
    }
  }, [level.levelNumber, state.level.levelNumber, dispatch]);

  // Mark level complete + submit score
  useEffect(() => {
    if (state.isComplete) {
      markLevelCompleted(state.level.levelNumber);

      // Submit score to leaderboard (only once per win)
      if (!scoreSubmitted.current) {
        scoreSubmitted.current = true;
        submitScore({
          uid,
          displayName,
          level: state.level.levelNumber,
          time: elapsed,
        });
      }

      // Start board shake celebration
      setIsCelebrating(true);

      // Show the overlay after the shake animation finishes (1s)
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 1100);

      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
      setIsCelebrating(false);
    }
  }, [state.isComplete, state.level.levelNumber]);

  function handleNextLevel() {
    if (pendingNextLevel.current) return;
    pendingNextLevel.current = true;

    // Modal has already slid away (WinOverlay waited 500ms before calling this)
    // Now hide overlay and start board slide-left
    setShowOverlay(false);
    setTransition("exit");

    // After board exit animation (400ms), trigger the actual level change
    setTimeout(() => {
      pendingNextLevel.current = false;
      onNextLevel();
    }, 400);
  }

  const transitionClass =
    transition === "exit"
      ? "level-exit"
      : transition === "enter"
        ? "level-enter"
        : "";

  return (
    <div className="flex flex-col items-center min-h-screen bg-bg p-4 overflow-hidden game-appear">
      <div className={`flex-1 flex flex-col items-center justify-center w-full ${transitionClass}`}>
        {/* Header */}
        <div className="w-full max-w-md flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Zip</h1>
            <p className="text-text-muted text-xs">Connect the dots. Fill every cell.</p>
          </div>
          <button
            onClick={onSignOut}
            title={userEmail}
            className="text-xs text-text-muted hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
        <div className="text-text-muted text-sm font-mono tabular-nums mb-3 tracking-wider">
          {formatTime(elapsed)}
        </div>
        <div className={`w-full max-w-md mx-auto ${isCelebrating ? "board-celebrate" : ""}`}>
          <Board state={state} dispatch={dispatch} />
        </div>
        <Controls
          levelNumber={state.level.levelNumber}
          gridSize={state.level.gridSize}
          pathLength={state.path.length}
          totalCells={state.level.gridSize * state.level.gridSize}
          onReset={() => dispatch({ type: "RESET" })}
          onBack={onBack}
          onLeaderboard={() => setShowLeaderboard(true)}
        />
      </div>

      {showOverlay && (
        <WinOverlay
          levelNumber={state.level.levelNumber}
          time={elapsed}
          onNextLevel={handleNextLevel}
          onBackToMenu={onBack}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          level={state.level.levelNumber}
          currentUid={uid}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
