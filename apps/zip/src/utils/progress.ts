const STORAGE_KEY = "zipgame-completed";

export function getCompletedLevels(): Set<number> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return new Set();
    return new Set(JSON.parse(data) as number[]);
  } catch {
    return new Set();
  }
}

export function markLevelCompleted(levelNumber: number): void {
  const completed = getCompletedLevels();
  completed.add(levelNumber);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}
