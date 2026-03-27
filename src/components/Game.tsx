import { useEffect } from "react";
import type { Level } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { markLevelCompleted } from "@/utils/progress";
import { Board } from "@/components/Board";
import { Controls } from "@/components/Controls";
import { WinOverlay } from "@/components/WinOverlay";

type GameProps = {
  level: Level;
  onBack: () => void;
  onNextLevel: () => void;
};

export function Game({ level, onBack, onNextLevel }: GameProps) {
  const [state, dispatch] = useGameState(level);

  // When level prop changes, select the new level
  useEffect(() => {
    if (state.level.levelNumber !== level.levelNumber) {
      dispatch({ type: "SELECT_LEVEL", levelNumber: level.levelNumber });
    }
  }, [level.levelNumber, state.level.levelNumber, dispatch]);

  // Mark level complete in localStorage
  useEffect(() => {
    if (state.isComplete) {
      markLevelCompleted(state.level.levelNumber);
    }
  }, [state.isComplete, state.level.levelNumber]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-bg p-4">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <Board state={state} dispatch={dispatch} />
        <Controls
          levelNumber={state.level.levelNumber}
          gridSize={state.level.gridSize}
          pathLength={state.path.length}
          totalCells={state.level.gridSize * state.level.gridSize}
          onReset={() => dispatch({ type: "RESET" })}
          onBack={onBack}
        />
      </div>

      {state.isComplete && (
        <WinOverlay
          levelNumber={state.level.levelNumber}
          onNextLevel={onNextLevel}
          onBackToMenu={onBack}
        />
      )}
    </div>
  );
}
