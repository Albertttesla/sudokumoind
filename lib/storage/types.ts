import type { GameStatus } from "@/lib/game/types";
import type { Board, Difficulty } from "@/lib/sudoku";

export type GameMode = "regular" | "daily";

export interface SerializedNotes {
  cells: number[][][];
}

export interface SavedGameProgress {
  mode: GameMode;
  difficulty: Difficulty;
  dateKey?: string;
  initial: Board;
  board: Board;
  solution: Board;
  notes: SerializedNotes;
  elapsed: number;
  mistakes: number;
  status: GameStatus;
  hintsUsed: number;
  notesMode: boolean;
  selected: { row: number; col: number } | null;
  savedAt: number;
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestTimes: Record<Difficulty, number | null>;
  dailyWins: number;
}

export interface LeaderboardEntry {
  playerName: string;
  timeSeconds: number;
  dateKey: string;
  completedAt: number;
}

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  bestTimes: { easy: null, medium: null, hard: null },
  dailyWins: 0,
};
