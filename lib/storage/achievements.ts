import type { Difficulty } from "@/lib/sudoku";
import { STORAGE_KEYS } from "./keys";

export type AchievementId =
  | "first_win"
  | "speed_demon"
  | "no_mistakes"
  | "hard_master";

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_win",
    title: "First Win",
    description: "Complete your first puzzle",
    emoji: "🏆",
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Solve a puzzle in under 3 minutes",
    emoji: "⚡",
  },
  {
    id: "no_mistakes",
    title: "No Mistakes",
    description: "Win without a single mistake",
    emoji: "✨",
  },
  {
    id: "hard_master",
    title: "Hard Mode Master",
    description: "Conquer a Hard difficulty puzzle",
    emoji: "🔥",
  },
];

const SPEED_DEMON_SECONDS = 180;

function loadUnlocked(): Set<AchievementId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.achievements);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AchievementId[]);
  } catch {
    return new Set();
  }
}

function saveUnlocked(ids: Set<AchievementId>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify([...ids]));
}

export function getUnlockedAchievements(): AchievementId[] {
  return [...loadUnlocked()];
}

export interface WinContext {
  elapsed: number;
  mistakes: number;
  difficulty: Difficulty;
  totalWinsBefore: number;
}

export function evaluateWinAchievements(ctx: WinContext): AchievementId[] {
  const unlocked = loadUnlocked();
  const newly: AchievementId[] = [];

  const tryUnlock = (id: AchievementId) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newly.push(id);
    }
  };

  if (ctx.totalWinsBefore === 0) tryUnlock("first_win");
  if (ctx.elapsed < SPEED_DEMON_SECONDS) tryUnlock("speed_demon");
  if (ctx.mistakes === 0) tryUnlock("no_mistakes");
  if (ctx.difficulty === "hard") tryUnlock("hard_master");

  if (newly.length > 0) saveUnlocked(unlocked);
  return newly;
}

export function getAchievementDef(id: AchievementId): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
