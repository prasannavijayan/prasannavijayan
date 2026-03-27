import type { Position, Dot, Level } from "@/types";

// Mulberry32 seeded PRNG
function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function getNeighbors(pos: Position, gridSize: number): Position[] {
  const neighbors: Position[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      neighbors.push({ row: r, col: c });
    }
  }
  return neighbors;
}

// Count unvisited neighbors of a position
function countUnvisitedNeighbors(
  pos: Position,
  gridSize: number,
  visited: boolean[][]
): number {
  let count = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && !visited[r][c]) {
      count++;
    }
  }
  return count;
}

// Generate a Hamiltonian path using Warnsdorff's heuristic with backtracking
function generateHamiltonianPath(
  gridSize: number,
  rng: () => number
): Position[] | null {
  const totalCells = gridSize * gridSize;
  const visited: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );
  const path: Position[] = [];

  // Random starting position
  const startRow = Math.floor(rng() * gridSize);
  const startCol = Math.floor(rng() * gridSize);
  const start: Position = { row: startRow, col: startCol };

  path.push(start);
  visited[start.row][start.col] = true;

  let maxBacktracks = totalCells * 10;

  while (path.length < totalCells) {
    const current = path[path.length - 1];
    const neighbors = getNeighbors(current, gridSize);

    // Filter to unvisited neighbors
    const unvisited = neighbors.filter((n) => !visited[n.row][n.col]);

    if (unvisited.length === 0) {
      // Backtrack
      if (maxBacktracks-- <= 0) return null;
      const removed = path.pop()!;
      visited[removed.row][removed.col] = false;
      if (path.length === 0) return null;
      continue;
    }

    // Warnsdorff: sort by number of onward moves (ascending), break ties randomly
    unvisited.sort((a, b) => {
      const countA = countUnvisitedNeighbors(a, gridSize, visited);
      const countB = countUnvisitedNeighbors(b, gridSize, visited);
      if (countA !== countB) return countA - countB;
      return rng() - 0.5;
    });

    const next = unvisited[0];
    path.push(next);
    visited[next.row][next.col] = true;
  }

  return path;
}

// Place dots along the solution path
function placeDots(
  path: Position[],
  dotCount: number,
  rng: () => number
): Dot[] {
  const dots: Dot[] = [];
  const totalSteps = path.length;

  // Always place first and last
  dots.push({ ...path[0], number: 1 });
  dots.push({ ...path[totalSteps - 1], number: dotCount });

  if (dotCount <= 2) return dots;

  // Place intermediate dots at roughly even intervals with some randomness
  const innerCount = dotCount - 2;
  const segmentSize = totalSteps / (dotCount - 1);

  for (let i = 1; i <= innerCount; i++) {
    const idealIndex = Math.round(i * segmentSize);
    // Add some jitter (up to 20% of segment size)
    const jitter = Math.floor((rng() - 0.5) * segmentSize * 0.4);
    const index = Math.max(1, Math.min(totalSteps - 2, idealIndex + jitter));
    dots.push({ ...path[index], number: i + 1 });
  }

  // Sort by number for consistency
  dots.sort((a, b) => a.number - b.number);
  return dots;
}

// Get difficulty parameters from level number
function getDifficultyParams(levelNumber: number): {
  gridSize: number;
  dotCount: number;
} {
  if (levelNumber <= 100) {
    const progress = (levelNumber - 1) / 99;
    const dotCount = Math.round(7 - progress * 2);
    return { gridSize: 5, dotCount };
  } else if (levelNumber <= 250) {
    const progress = (levelNumber - 101) / 149;
    const dotCount = Math.round(6 - progress * 2);
    return { gridSize: 6, dotCount };
  } else if (levelNumber <= 400) {
    const progress = (levelNumber - 251) / 149;
    const dotCount = Math.round(5 - progress);
    return { gridSize: 7, dotCount };
  } else {
    const progress = (levelNumber - 401) / 99;
    const dotCount = Math.round(5 - progress * 2);
    return { gridSize: 8, dotCount: Math.max(3, dotCount) };
  }
}

export function generateLevel(levelNumber: number): Level {
  const rng = seededRng(levelNumber * 7919 + 104729);
  const { gridSize, dotCount } = getDifficultyParams(levelNumber);

  // Try to generate with multiple attempts (different seed offsets)
  for (let attempt = 0; attempt < 20; attempt++) {
    const attemptRng = seededRng(
      levelNumber * 7919 + 104729 + attempt * 31337
    );
    const solution = generateHamiltonianPath(gridSize, attemptRng);
    if (solution) {
      const dots = placeDots(solution, dotCount, rng);
      return { levelNumber, gridSize, dots, solution };
    }
  }

  // Fallback: snake path (guaranteed Hamiltonian)
  const solution: Position[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const col = r % 2 === 0 ? c : gridSize - 1 - c;
      solution.push({ row: r, col });
    }
  }
  const dots = placeDots(solution, dotCount, rng);
  return { levelNumber, gridSize, dots, solution };
}
