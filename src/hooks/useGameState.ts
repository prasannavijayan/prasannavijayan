import { useReducer } from "react";
import type { GameState, GameAction, Level } from "@/types";
import { generateLevel } from "@/utils/levelGenerator";
import {
  isAdjacent,
  posKey,
  buildPathSet,
  getDotAt,
  checkWin,
} from "@/utils/validation";

function createInitialState(level: Level): GameState {
  return {
    level,
    path: [],
    isComplete: false,
    isDragging: false,
    nextRequiredDot: 1,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_DRAG": {
      const { position } = action;
      const dot = getDotAt(position.row, position.col, state.level.dots);

      // Can only start from dot 1
      if (!dot || dot.number !== 1) return state;

      return {
        ...state,
        path: [position],
        isDragging: true,
        isComplete: false,
        nextRequiredDot: 2,
      };
    }

    case "EXTEND_PATH": {
      if (!state.isDragging || state.path.length === 0) return state;

      const { position } = action;
      const tail = state.path[state.path.length - 1];

      // Must be adjacent
      if (!isAdjacent(tail, position)) return state;

      // Must not already be in path
      const pathSet = buildPathSet(state.path);
      if (pathSet.has(posKey(position))) return state;

      // Check if position has a dot
      const dot = getDotAt(position.row, position.col, state.level.dots);
      let nextDot = state.nextRequiredDot;

      if (dot) {
        // If it's a dot, it must be the next required one
        if (dot.number !== nextDot) return state;
        nextDot = dot.number + 1;
      }

      const newPath = [...state.path, position];
      const isComplete = checkWin(
        newPath,
        state.level.gridSize,
        state.level.dots.length,
        nextDot
      );

      return {
        ...state,
        path: newPath,
        nextRequiredDot: nextDot,
        isComplete,
      };
    }

    case "RETRACT_PATH": {
      if (!state.isDragging || state.path.length <= 1) return state;

      const { position } = action;
      const secondToLast = state.path[state.path.length - 2];

      // Can only retract to the previous cell
      if (secondToLast.row !== position.row || secondToLast.col !== position.col)
        return state;

      const removed = state.path[state.path.length - 1];
      let nextDot = state.nextRequiredDot;

      // If the removed cell was a dot, decrement nextRequiredDot
      const dot = getDotAt(removed.row, removed.col, state.level.dots);
      if (dot && dot.number === nextDot - 1) {
        nextDot = dot.number;
      }

      return {
        ...state,
        path: state.path.slice(0, -1),
        nextRequiredDot: nextDot,
        isComplete: false,
      };
    }

    case "END_DRAG": {
      return { ...state, isDragging: false };
    }

    case "RESET": {
      return createInitialState(state.level);
    }

    case "SELECT_LEVEL": {
      const level = generateLevel(action.levelNumber);
      return createInitialState(level);
    }

    default:
      return state;
  }
}

export function useGameState(initialLevel: Level) {
  return useReducer(gameReducer, initialLevel, createInitialState);
}
