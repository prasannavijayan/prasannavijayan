import type { Position, Dot } from "@/types";

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function getDotAt(
  row: number,
  col: number,
  dots: Dot[]
): Dot | undefined {
  return dots.find((d) => d.row === row && d.col === col);
}

export function buildPathSet(path: Position[]): Set<string> {
  return new Set(path.map(posKey));
}

export function checkWin(
  path: Position[],
  gridSize: number,
  totalDots: number,
  nextRequiredDot: number
): boolean {
  return path.length === gridSize * gridSize && nextRequiredDot > totalDots;
}
