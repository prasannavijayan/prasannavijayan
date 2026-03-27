import { useState } from "react";
import type { Level } from "@/types";
import { generateLevel } from "@/utils/levelGenerator";
import { LevelSelect } from "@/components/LevelSelect";
import { Game } from "@/components/Game";

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

  function handleSelectLevel(levelNumber: number) {
    setCurrentLevel(generateLevel(levelNumber));
  }

  function handleBack() {
    setCurrentLevel(null);
  }

  function handleNextLevel() {
    if (currentLevel && currentLevel.levelNumber < 500) {
      setCurrentLevel(generateLevel(currentLevel.levelNumber + 1));
    }
  }

  if (!currentLevel) {
    return <LevelSelect onSelectLevel={handleSelectLevel} />;
  }

  return (
    <Game
      level={currentLevel}
      onBack={handleBack}
      onNextLevel={handleNextLevel}
    />
  );
}
