// IndexedDB store for in-progress review timers, keyed by post slug.
// Survives page reloads / dev-server restarts so a started review isn't lost.
// Dev-only (used by the Review Timer dev toolbar app).

export type ReviewRecord = {
  slug: string;
  startedAt: number;
  completedAt: number | null;
  status: "in-progress" | "done";
};

const DB_NAME = "pv-provenance";
const STORE = "reviews";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "slug" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = op(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function getReview(slug: string): Promise<ReviewRecord | undefined> {
  return run<ReviewRecord | undefined>("readonly", (s) => s.get(slug));
}

export async function startReview(slug: string): Promise<ReviewRecord> {
  const record: ReviewRecord = { slug, startedAt: Date.now(), completedAt: null, status: "in-progress" };
  await run("readwrite", (s) => s.put(record));
  return record;
}

export async function completeReview(slug: string): Promise<ReviewRecord | undefined> {
  const record = await getReview(slug);
  if (!record) return undefined;
  record.completedAt = Date.now();
  record.status = "done";
  await run("readwrite", (s) => s.put(record));
  return record;
}

export async function resetReview(slug: string): Promise<void> {
  await run("readwrite", (s) => s.delete(slug));
}
