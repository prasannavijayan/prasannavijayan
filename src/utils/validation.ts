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
  rows: number,
  cols: number,
  wallCount: number,
  totalDots: number,
  nextRequiredDot: number,
  dots: Dot[]
): boolean {
  // Path must cover every non-wall cell exactly once
  if (path.length !== rows * cols - wallCount) return false;
  if (nextRequiredDot <= totalDots) return false;

  // Path must end on the last numbered dot
  const lastDot = dots.find((d) => d.number === totalDots);
  if (!lastDot) return false;
  const lastPos = path[path.length - 1];
  return lastPos.row === lastDot.row && lastPos.col === lastDot.col;
}
