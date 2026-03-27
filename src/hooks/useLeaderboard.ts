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

const LEADERBOARD_KEY = (level: number) => ["leaderboard", level];

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

async function submitScore(
  uid: string,
  displayName: string,
  level: number,
  time: number
): Promise<void> {
  const docId = `${uid}_${level}`;
  const ref = doc(db, "leaderboard", docId);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const prev = existing.data() as LeaderboardEntry;
    // Only update if new time is faster
    if (time >= prev.time) return;
  }

  await setDoc(ref, {
    uid,
    displayName,
    level,
    time,
    updated_at: new Date().toISOString(),
  });
}

export function useLeaderboard(level: number, enabled: boolean) {
  return useQuery({
    queryKey: LEADERBOARD_KEY(level),
    queryFn: () => fetchLeaderboard(level),
    enabled,
    staleTime: 30_000, // 30s cache
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
      // Invalidate leaderboard cache for this level
      queryClient.invalidateQueries({
        queryKey: LEADERBOARD_KEY(vars.level),
      });
    },
  });
}
