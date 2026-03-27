export type Position = {
  row: number;
  col: number;
};

export type Dot = {
  row: number;
  col: number;
  number: number;
};

export type Level = {
  levelNumber: number;
  gridSize: number;
  dots: Dot[];
  solution: Position[];
};

export type GameAction =
  | { type: "START_DRAG"; position: Position }
  | { type: "EXTEND_PATH"; position: Position }
  | { type: "RETRACT_PATH"; position: Position }
  | { type: "END_DRAG" }
  | { type: "RESET" }
  | { type: "SELECT_LEVEL"; levelNumber: number };

export type GameState = {
  level: Level;
  path: Position[];
  isComplete: boolean;
  isDragging: boolean;
  nextRequiredDot: number;
};
