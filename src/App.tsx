import { useEffect, useState } from "react";
import type { Level } from "@/types";
import { generateLevel } from "@/utils/levelGenerator";
import { LevelSelect } from "@/components/LevelSelect";
import { Game } from "@/components/Game";
import { AuthScreen } from "@/components/AuthScreen";
import { useAuth } from "@/hooks/useAuth";
import { useProgress, useUpdateProgress } from "@/hooks/useProgress";

export default function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut } = useAuth();
  const { data: savedLevel, isLoading: progressLoading, error: progressError } = useProgress(user?.uid);
  const { mutate: updateProgress } = useUpdateProgress(user?.uid);

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  // Once progress loads (or fails), jump into the saved level or default to 1
  const effectiveLevel = savedLevel ?? (progressError ? 1 : undefined);

  useEffect(() => {
    if (effectiveLevel !== undefined && currentLevel === null && !showLevelSelect) {
      setCurrentLevel(generateLevel(effectiveLevel));
    }
  }, [effectiveLevel, currentLevel, showLevelSelect]);

  function handleSelectLevel(levelNumber: number) {
    setCurrentLevel(generateLevel(levelNumber));
    setShowLevelSelect(false);
  }

  function handleBack() {
    setCurrentLevel(null);
    setShowLevelSelect(true);
  }

  // Only advance to next level if user is progressing past their saved level
  function handleNextLevel() {
    if (!currentLevel) return;
    const nextLevelNumber = currentLevel.levelNumber + 1;
    if (nextLevelNumber > 500) return;

    // Update DB only when advancing beyond saved progress
    if (savedLevel !== undefined && currentLevel.levelNumber >= savedLevel) {
      updateProgress(nextLevelNumber);
    }

    setCurrentLevel(generateLevel(nextLevelNumber));
  }

  // DEBUG: log state to console on every render
  console.log("[App] authLoading:", authLoading, "user:", user?.uid, "progressLoading:", progressLoading, "progressError:", progressError?.toString(), "savedLevel:", savedLevel, "effectiveLevel:", effectiveLevel, "currentLevel:", currentLevel?.levelNumber, "showLevelSelect:", showLevelSelect);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[--color-bg] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[--color-path] border-t-transparent animate-spin" />
        <p className="text-white text-xs">Checking auth...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSignIn={signInWithGoogle} error={authError} />;
  }

  if (progressLoading && !progressError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[--color-bg] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[--color-path] border-t-transparent animate-spin" />
        <p className="text-white text-xs">Loading progress...</p>
      </div>
    );
  }

  // If Firestore fails, default to level 1
  if (progressError) {
    console.error("Progress fetch failed:", progressError);
  }

  if (showLevelSelect || !currentLevel) {
    return (
      <LevelSelect
        onSelectLevel={handleSelectLevel}
        onSignOut={signOut}
        userEmail={user.email ?? undefined}
      />
    );
  }

  return (
    <Game
      level={currentLevel}
      onBack={handleBack}
      onNextLevel={handleNextLevel}
    />
  );
}
