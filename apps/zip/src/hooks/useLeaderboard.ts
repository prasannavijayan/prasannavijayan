import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  level: number;
  time: number; // seconds
  updated_at: string;
};

export type OverallEntry = {
  uid: string;
  displayName: string;
  totalTime: number;    // sum of best times across all completed levels
  levelsCompleted: number;
  updated_at: string;
};

const LEADERBOARD_KEY = (level: number) => ["leaderboard", level];
const OVERALL_KEY = ["leaderboard", "overall"];

async function fetchLeaderboard(level: number): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, "leaderboard"),
    where("level", "==", level),
    orderBy("time", "asc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}

async function fetchOverallLeaderboard(): Promise<OverallEntry[]> {
  const q = query(
    collection(db, "overall_leaderboard"),
    orderBy("levelsCompleted", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  const entries = snap.docs.map((d) => d.data() as OverallEntry);
  // Secondary sort: same level count → lower total time wins
  return entries.sort((a, b) =>
    b.levelsCompleted !== a.levelsCompleted
      ? b.levelsCompleted - a.levelsCompleted
      : a.totalTime - b.totalTime
  );
}

async function submitScore(
  uid: string,
  displayName: string,
  level: number,
  time: number
): Promise<void> {
  const docId = `${uid}_${level}`;
  const ref = doc(db, "leaderboard", docId);
  const existing = await getDoc(ref);

  const isNewEntry = !existing.exists();

  if (!isNewEntry) {
    const prev = existing.data() as LeaderboardEntry;
    // Only update if new time is faster
    if (time >= prev.time) return;
  }

  const oldTime = isNewEntry ? 0 : (existing.data() as LeaderboardEntry).time;

  // Update per-level score
  await setDoc(ref, {
    uid,
    displayName,
    level,
    time,
    updated_at: new Date().toISOString(),
  });

  // Update overall score using delta so improvements reduce the total
  const overallRef = doc(db, "overall_leaderboard", uid);
  const overallDoc = await getDoc(overallRef);

  if (overallDoc.exists()) {
    const overall = overallDoc.data() as OverallEntry;
    await setDoc(overallRef, {
      uid,
      displayName,
      totalTime: overall.totalTime + (time - oldTime),
      levelsCompleted: isNewEntry ? overall.levelsCompleted + 1 : overall.levelsCompleted,
      updated_at: new Date().toISOString(),
    });
  } else {
    await setDoc(overallRef, {
      uid,
      displayName,
      totalTime: time,
      levelsCompleted: 1,
      updated_at: new Date().toISOString(),
    });
  }
}

export function useLeaderboard(level: number, enabled: boolean) {
  return useQuery({
    queryKey: LEADERBOARD_KEY(level),
    queryFn: () => fetchLeaderboard(level),
    enabled,
    staleTime: 30_000,
  });
}

export function useOverallLeaderboard(enabled: boolean) {
  return useQuery({
    queryKey: OVERALL_KEY,
    queryFn: fetchOverallLeaderboard,
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      displayName,
      level,
      time,
    }: {
      uid: string;
      displayName: string;
      level: number;
      time: number;
    }) => submitScore(uid, displayName, level, time),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_KEY(vars.level) });
      queryClient.invalidateQueries({ queryKey: OVERALL_KEY });
    },
  });
}
