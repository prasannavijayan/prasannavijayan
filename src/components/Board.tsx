import { useEffect, useRef, type PointerEvent } from "react";
import type { Position, GameAction, GameState } from "@/types";
import { posKey, buildPathSet, getDotAt } from "@/utils/validation";
import { Cell } from "@/components/Cell";

const ARROW_DELTAS: Record<string, Position> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
};

type BoardProps = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

function pointerToCell(
  e: PointerEvent,
  boardEl: HTMLElement,
  gridSize: number
): Position {
  const rect = boardEl.getBoundingClientRect();
  const cellWidth = rect.width / gridSize;
  const cellHeight = rect.height / gridSize;
  const col = Math.floor((e.clientX - rect.left) / cellWidth);
  const row = Math.floor((e.clientY - rect.top) / cellHeight);
  return {
    row: Math.max(0, Math.min(gridSize - 1, row)),
    col: Math.max(0, Math.min(gridSize - 1, col)),
  };
}

export function Board({ state, dispatch }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const lastCellRef = useRef<string | null>(null);
  const { level, path, isDragging, isComplete, nextRequiredDot } = state;
  const { gridSize, dots } = level;

  const pathSet = buildPathSet(path);
  const pathKeyToIndex = new Map<string, number>();
  path.forEach((p, i) => pathKeyToIndex.set(posKey(p), i));

  // Determine which dots are connected (their number < nextRequiredDot)
  const connectedDotNumbers = new Set<number>();
  for (let n = 1; n < nextRequiredDot; n++) {
    connectedDotNumbers.add(n);
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (isComplete) return;
    if (!boardRef.current) return;

    const pos = pointerToCell(e, boardRef.current, gridSize);
    lastCellRef.current = posKey(pos);
    boardRef.current.setPointerCapture(e.pointerId);
    dispatch({ type: "START_DRAG", position: pos });
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!isDragging || !boardRef.current) return;

    const pos = pointerToCell(e, boardRef.current, gridSize);
    const key = posKey(pos);

    // Skip if same cell as last
    if (key === lastCellRef.current) return;
    lastCellRef.current = key;

    // Check if this is a retraction (moving to second-to-last cell)
    if (path.length >= 2) {
      const secondToLast = path[path.length - 2];
      if (secondToLast.row === pos.row && secondToLast.col === pos.col) {
        dispatch({ type: "RETRACT_PATH", position: pos });
        return;
      }
    }

    dispatch({ type: "EXTEND_PATH", position: pos });
  }

  function handlePointerUp() {
    lastCellRef.current = null;
    dispatch({ type: "END_DRAG" });
  }

  // Keyboard arrow key support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isComplete) return;
      const delta = ARROW_DELTAS[e.key];
      if (!delta) return;
      e.preventDefault();

      if (path.length === 0) {
        // Auto-start from dot 1
        const dot1 = dots.find((d) => d.number === 1);
        if (dot1) {
          dispatch({ type: "START_DRAG", position: { row: dot1.row, col: dot1.col } });
        }
        return;
      }

      const tail = path[path.length - 1];
      const target: Position = {
        row: tail.row + delta.row,
        col: tail.col + delta.col,
      };

      // Out of bounds
      if (target.row < 0 || target.row >= gridSize || target.col < 0 || target.col >= gridSize) return;

      // Check if retracting (moving back to second-to-last cell)
      if (path.length >= 2) {
        const prev = path[path.length - 2];
        if (prev.row === target.row && prev.col === target.col) {
          dispatch({ type: "RETRACT_PATH", position: target });
          return;
        }
      }

      dispatch({ type: "EXTEND_PATH", position: target });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [path, isComplete, gridSize, dots, dispatch]);

  // Build grid cells
  const cells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const key = posKey({ row, col });
      const dotInfo = getDotAt(row, col, dots);
      const isInPath = pathSet.has(key);
      const pathIdx = pathKeyToIndex.get(key) ?? -1;
      const isHead = pathIdx === path.length - 1 && path.length > 0;
      const isConnectedDot = dotInfo
        ? connectedDotNumbers.has(dotInfo.number)
        : false;

      // Determine connectors
      let connectTop = false;
      let connectBottom = false;
      let connectLeft = false;
      let connectRight = false;

      if (isInPath && pathIdx >= 0) {
        const prev = pathIdx > 0 ? path[pathIdx - 1] : null;
        const next = pathIdx < path.length - 1 ? path[pathIdx + 1] : null;

        if (prev) {
          if (prev.row < row) connectTop = true;
          if (prev.row > row) connectBottom = true;
          if (prev.col < col) connectLeft = true;
          if (prev.col > col) connectRight = true;
        }
        if (next) {
          if (next.row < row) connectTop = true;
          if (next.row > row) connectBottom = true;
          if (next.col < col) connectLeft = true;
          if (next.col > col) connectRight = true;
        }
      }

      cells.push(
        <Cell
          key={key}
          dotInfo={dotInfo}
          isInPath={isInPath}
          isHead={isHead}
          isConnectedDot={isConnectedDot}
          pathIndex={pathIdx}
          totalPathLength={path.length}
          connectTop={connectTop}
          connectBottom={connectBottom}
          connectLeft={connectLeft}
          connectRight={connectRight}
        />
      );
    }
  }

  return (
    <div
      ref={boardRef}
      className="w-full aspect-square max-w-md mx-auto touch-none select-none cursor-crosshair"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: "1px",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {cells}
    </div>
  );
}
