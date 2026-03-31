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
  gridSize: number;    // rows
  gridCols?: number;   // cols — omitted when equal to gridSize (square grid)
  dots: Dot[];
  solution: Position[];
  walls: Position[];   // blocked cells — empty array for levels 1–500
};

export type GameAction =
  | { type: "START_DRAG"; position: Position }
  | { type: "EXTEND_PATH"; position: Position }
  | { type: "RETRACT_PATH"; position: Position }
  | { type: "RETRACT_TO"; position: Position }
  | { type: "END_DRAG" }
  | { type: "RESET" }
  | { type: "SELECT_LEVEL"; level: Level };

export type GameState = {
  level: Level;
  path: Position[];
  isComplete: boolean;
  isDragging: boolean;
  nextRequiredDot: number;
};
