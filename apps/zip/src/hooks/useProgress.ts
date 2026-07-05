import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROGRESS_KEY = (uid: string) => ["progress", uid];

async function fetchProgress(uid: string): Promise<number> {
  const snap = await getDoc(doc(db, "user_progress", uid));
  return snap.exists() ? (snap.data().current_level as number) : 1;
}

async function saveProgress(uid: string, level: number): Promise<void> {
  await setDoc(
    doc(db, "user_progress", uid),
    { current_level: level, updated_at: new Date().toISOString() },
    { merge: true }
  );
}

export function useProgress(uid: string | undefined) {
  return useQuery({
    queryKey: PROGRESS_KEY(uid!),
    queryFn: () => fetchProgress(uid!),
    enabled: !!uid,
    staleTime: Infinity,
    retry: 1,
  });
}

export function useUpdateProgress(uid: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (level: number) => saveProgress(uid!, level),
    onSuccess: (_data, level) => {
      queryClient.setQueryData(PROGRESS_KEY(uid!), level);
    },
  });
}
