import type { Position, Dot, Level } from "@/types";

// ── Seeded PRNG (Mulberry32) ──────────────────────────────────────────────────

function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// djb2-style hash so each player gets unique puzzle layouts
function hashUid(uid: string): number {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (Math.imul(31, hash) + uid.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ── Grid helpers ──────────────────────────────────────────────────────────────

const DIRECTIONS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function pkey(row: number, col: number): string {
  return `${row},${col}`;
}

function getNeighbors(
  pos: Position,
  rows: number,
  cols: number,
  wallSet: Set<string>
): Position[] {
  const out: Position[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols && !wallSet.has(pkey(r, c))) {
      out.push({ row: r, col: c });
    }
  }
  return out;
}

function countUnvisited(
  pos: Position,
  rows: number,
  cols: number,
  visited: boolean[][],
  wallSet: Set<string>
): number {
  let n = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (
      r >= 0 && r < rows &&
      c >= 0 && c < cols &&
      !visited[r][c] &&
      !wallSet.has(pkey(r, c))
    ) n++;
  }
  return n;
}

// ── Wall generation ───────────────────────────────────────────────────────────

/** BFS connectivity check — all non-wall cells must be reachable from one another */
function isConnected(rows: number, cols: number, walls: Position[]): boolean {
  const wallSet = new Set(walls.map(w => pkey(w.row, w.col)));
  const freeCells = rows * cols - walls.length;
  if (freeCells <= 0) return false;

  let start: Position | null = null;
  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!wallSet.has(pkey(r, c))) { start = { row: r, col: c }; break outer; }
    }
  }
  if (!start) return false;

  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(pkey(start.row, start.col));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const [dr, dc] of DIRECTIONS) {
      const r = curr.row + dr;
      const c = curr.col + dc;
      const k = pkey(r, c);
      if (r >= 0 && r < rows && c >= 0 && c < cols && !wallSet.has(k) && !visited.has(k)) {
        visited.add(k);
        queue.push({ row: r, col: c });
      }
    }
  }
  return visited.size === freeCells;
}

/** Place `wallCount` walls randomly while keeping remaining cells connected */
function generateWalls(
  rows: number,
  cols: number,
  wallCount: number,
  rng: () => number
): Position[] {
  // Build a shuffled list of all cell positions
  const positions: Position[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      positions.push({ row: r, col: c });

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const walls: Position[] = [];
  for (const pos of positions) {
    if (walls.length >= wallCount) break;
    const candidate = [...walls, pos];
    if (isConnected(rows, cols, candidate)) walls.push(pos);
  }
  return walls;
}

// ── Hamiltonian path (Warnsdorff + backtracking) ──────────────────────────────

function generateHamiltonianPath(
  rows: number,
  cols: number,
  wallSet: Set<string>,
  rng: () => number
): Position[] | null {
  const totalCells = rows * cols - wallSet.size;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  // Pre-mark walls so they're never chosen
  for (const key of wallSet) {
    const [r, c] = key.split(",").map(Number);
    visited[r][c] = true;
  }

  // Pick a random non-wall starting cell
  const free: Position[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!wallSet.has(pkey(r, c))) free.push({ row: r, col: c });

  const start = free[Math.floor(rng() * free.length)];
  const path: Position[] = [start];
  visited[start.row][start.col] = true;

  let maxBacktracks = totalCells * 10;

  while (path.length < totalCells) {
    const current = path[path.length - 1];
    const unvisited = getNeighbors(current, rows, cols, wallSet).filter(
      n => !visited[n.row][n.col]
    );

    if (unvisited.length === 0) {
      if (maxBacktracks-- <= 0) return null;
      const removed = path.pop()!;
      visited[removed.row][removed.col] = false;
      if (path.length === 0) return null;
      continue;
    }

    // Warnsdorff: prefer cells with fewer onward moves; break ties randomly
    unvisited.sort((a, b) => {
      const ca = countUnvisited(a, rows, cols, visited, wallSet);
      const cb = countUnvisited(b, rows, cols, visited, wallSet);
      return ca !== cb ? ca - cb : rng() - 0.5;
    });

    const next = unvisited[0];
    path.push(next);
    visited[next.row][next.col] = true;
  }

  return path;
}

// ── Dot placement ─────────────────────────────────────────────────────────────

function placeDots(path: Position[], dotCount: number, rng: () => number): Dot[] {
  const dots: Dot[] = [];
  const total = path.length;

  dots.push({ ...path[0], number: 1 });
  dots.push({ ...path[total - 1], number: dotCount });
  if (dotCount <= 2) return dots;

  const innerCount = dotCount - 2;
  const segmentSize = total / (dotCount - 1);

  for (let i = 1; i <= innerCount; i++) {
    const ideal = Math.round(i * segmentSize);
    const jitter = Math.floor((rng() - 0.5) * segmentSize * 0.4);
    const idx = Math.max(1, Math.min(total - 2, ideal + jitter));
    dots.push({ ...path[idx], number: i + 1 });
  }

  dots.sort((a, b) => a.number - b.number);
  return dots;
}

// ── Difficulty tiers ──────────────────────────────────────────────────────────

function getDifficultyParams(levelNumber: number): {
  rows: number;
  cols: number;
  dotCount: number;
  wallCount: number;
} {
  if (levelNumber <= 100) {
    const p = (levelNumber - 1) / 99;
    return { rows: 5, cols: 5, dotCount: Math.round(7 - p * 2), wallCount: 0 };
  }
  if (levelNumber <= 250) {
    const p = (levelNumber - 101) / 149;
    return { rows: 6, cols: 6, dotCount: Math.round(6 - p * 2), wallCount: 0 };
  }
  if (levelNumber <= 400) {
    const p = (levelNumber - 251) / 149;
    return { rows: 7, cols: 7, dotCount: Math.round(5 - p), wallCount: 0 };
  }
  if (levelNumber <= 500) {
    const p = (levelNumber - 401) / 99;
    return { rows: 8, cols: 8, dotCount: Math.max(3, Math.round(5 - p * 2)), wallCount: 0 };
  }
  // ── Wall tiers ────────────────────────────────────────────────────────────
  if (levelNumber <= 600) {
    const p = (levelNumber - 501) / 99;
    return { rows: 6, cols: 6, dotCount: Math.max(3, Math.round(5 - p * 2)), wallCount: Math.round(3 + p) };
  }
  if (levelNumber <= 700) {
    const p = (levelNumber - 601) / 99;
    return { rows: 7, cols: 7, dotCount: Math.max(3, Math.round(5 - p * 2)), wallCount: Math.round(4 + p * 2) };
  }
  if (levelNumber <= 800) {
    const p = (levelNumber - 701) / 99;
    return { rows: 8, cols: 8, dotCount: Math.max(3, Math.round(5 - p * 2)), wallCount: Math.round(5 + p * 3) };
  }
  // 801–900: 9 rows × 8 cols
  const p = (levelNumber - 801) / 99;
  return { rows: 9, cols: 8, dotCount: Math.max(3, Math.round(5 - p * 2)), wallCount: Math.round(6 + p * 4) };
}

// ── Public API ────────────────────────────────────────────────────────────────

const EMPTY_WALL_SET = new Set<string>();

export function generateLevel(levelNumber: number, uid?: string): Level {
  // Levels 1–500: shared deterministic puzzles (same for everyone)
  // Levels 501+: per-player unique puzzles via UID salt
  const uidSalt = levelNumber > 500 && uid ? hashUid(uid) : 0;
  const baseSeed = levelNumber * 7919 + 104729 + uidSalt * 1000003;
  // Stable rng used only for dot placement (independent of attempt)
  const dotRng = seededRng(baseSeed);
  const { rows, cols, dotCount, wallCount } = getDifficultyParams(levelNumber);

  // gridCols only set when the grid is non-square
  const gridCols = cols !== rows ? cols : undefined;

  for (let attempt = 0; attempt < 30; attempt++) {
    const rng = seededRng(baseSeed + attempt * 31337);

    let walls: Position[] = [];
    let wallSet = EMPTY_WALL_SET;
    if (wallCount > 0) {
      walls = generateWalls(rows, cols, wallCount, rng);
      wallSet = new Set(walls.map(w => pkey(w.row, w.col)));
    }

    const solution = generateHamiltonianPath(rows, cols, wallSet, rng);
    if (solution) {
      const dots = placeDots(solution, dotCount, dotRng);
      return { levelNumber, gridSize: rows, gridCols, dots, solution, walls };
    }
  }

  // Fallback: snake path with no walls (always a valid Hamiltonian path)
  const solution: Position[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const col = r % 2 === 0 ? c : cols - 1 - c;
      solution.push({ row: r, col });
    }
  }
  const dots = placeDots(solution, dotCount, dotRng);
  return { levelNumber, gridSize: rows, gridCols, dots, solution, walls: [] };
}
