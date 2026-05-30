import type { Difficulty } from "@/lib/sudoku";
import { STORAGE_KEYS } from "./keys";
import { DEFAULT_STATS, type GameStats } from "./types";

export function loadStats(): GameStats {
  if (typeof window === "undefined") return { ...DEFAULT_STATS, bestTimes: { ...DEFAULT_STATS.bestTimes } };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    if (!raw) return { ...DEFAULT_STATS, bestTimes: { ...DEFAULT_STATS.bestTimes } };
    const parsed = JSON.parse(raw) as GameStats;
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bestTimes: { ...DEFAULT_STATS.bestTimes, ...parsed.bestTimes },
    };
  } catch {
    return { ...DEFAULT_STATS, bestTimes: { ...DEFAULT_STATS.bestTimes } };
  }
}

export function saveStats(stats: GameStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
}

export function recordRegularResult(
  won: boolean,
  difficulty: Difficulty,
  elapsed: number,
): GameStats {
  const stats = loadStats();
  stats.gamesPlayed += 1;
  if (won) {
    stats.wins += 1;
    const current = stats.bestTimes[difficulty];
    if (current === null || elapsed < current) {
      stats.bestTimes[difficulty] = elapsed;
    }
  } else {
    stats.losses += 1;
  }
  saveStats(stats);
  return stats;
}

export function recordDailyWin(): GameStats {
  const stats = loadStats();
  stats.dailyWins += 1;
  saveStats(stats);
  return stats;
}

export function getWinRate(stats: GameStats): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.wins / stats.gamesPlayed) * 100);
}

export function formatSeconds(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
