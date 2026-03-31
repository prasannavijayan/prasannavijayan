import { useEffect, useState } from "react";
import type { Level } from "@/types";
import { generateLevel } from "@/utils/levelGenerator";
import { LevelSelect } from "@/components/LevelSelect";
import { Game } from "@/components/Game";
import { AuthScreen } from "@/components/AuthScreen";
import { useAuth } from "@/hooks/useAuth";
import { useProgress, useUpdateProgress } from "@/hooks/useProgress";
import { getCompletedLevels } from "@/utils/progress";

type Screen = "menu" | "game";
type TransitionState = "idle" | "zoom-in" | "zoom-out";

export default function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut } = useAuth();
  const { data: savedLevel, isLoading: progressLoading, error: progressError } = useProgress(user?.uid);
  const { mutate: updateProgress } = useUpdateProgress(user?.uid);

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [screen, setScreen] = useState<Screen>("menu");
  const [transition, setTransition] = useState<TransitionState>("idle");
  const [pendingLevel, setPendingLevel] = useState<Level | null>(null);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  // Once progress loads (or fails), jump into the saved level or default to 1
  const effectiveLevel = savedLevel ?? (progressError ? 1 : undefined);

  // Auto-load into game on first load only
  useEffect(() => {
    if (!hasAutoLoaded && effectiveLevel !== undefined && currentLevel === null && screen === "menu" && transition === "idle") {
      setHasAutoLoaded(true);
      const level = generateLevel(effectiveLevel, user?.uid);
      setPendingLevel(level);
      setTransition("zoom-in");

      setTimeout(() => {
        setCurrentLevel(level);
        setScreen("game");
        setPendingLevel(null);
        setTransition("idle");
      }, 500);
    }
  }, [hasAutoLoaded, effectiveLevel, currentLevel, screen, transition]);

  function handleSelectLevel(levelNumber: number) {
    const level = generateLevel(levelNumber, user?.uid);
    setPendingLevel(level);
    setTransition("zoom-in");

    setTimeout(() => {
      setCurrentLevel(level);
      setScreen("game");
      setPendingLevel(null);
      setTransition("idle");
    }, 500);
  }

  function handleBack() {
    // If returning from a completed level at/beyond saved progress, advance the saved level
    if (currentLevel && savedLevel !== undefined && currentLevel.levelNumber >= savedLevel) {
      const completed = getCompletedLevels();
      if (completed.has(currentLevel.levelNumber)) {
        updateProgress(currentLevel.levelNumber + 1);
      }
    }

    setTransition("zoom-out");

    setTimeout(() => {
      setCurrentLevel(null);
      setScreen("menu");
      setTransition("idle");
    }, 350);
  }

  // Only advance to next level if user is progressing past their saved level
  function handleNextLevel() {
    if (!currentLevel) return;
    const nextLevelNumber = currentLevel.levelNumber + 1;
    if (nextLevelNumber > 900) return;

    // Update DB only when advancing beyond saved progress
    if (savedLevel !== undefined && currentLevel.levelNumber >= savedLevel) {
      updateProgress(nextLevelNumber);
    }

    setCurrentLevel(generateLevel(nextLevelNumber, user?.uid));
  }

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

  // Zoom-in transition overlay (menu → game)
  if (transition === "zoom-in") {
    return (
      <div className="min-h-screen bg-bg page-zoom-in">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Level {pendingLevel?.levelNumber}
            </h2>
            <p className="text-text-muted text-sm">
              {pendingLevel?.gridSize}x{pendingLevel?.gridCols ?? pendingLevel?.gridSize}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Zoom-out transition (game → menu)
  if (transition === "zoom-out" && currentLevel) {
    return (
      <div className="min-h-screen bg-bg page-zoom-out">
        <Game
          level={currentLevel}
          uid={user.uid}
          displayName={user.displayName ?? user.email ?? "Anonymous"}
          userEmail={user.email ?? undefined}
          onBack={() => {}}
          onNextLevel={() => {}}
          onSignOut={() => {}}
        />
      </div>
    );
  }

  if (screen === "menu" || !currentLevel) {
    return (
      <div className="page-enter-menu">
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          onSignOut={signOut}
          userEmail={user.email ?? undefined}
          currentLevel={effectiveLevel ?? 1}
        />
      </div>
    );
  }

  return (
    <Game
      level={currentLevel}
      uid={user.uid}
      displayName={user.displayName ?? user.email ?? "Anonymous"}
      userEmail={user.email ?? undefined}
      onBack={handleBack}
      onNextLevel={handleNextLevel}
      onSignOut={signOut}
    />
  );
}
