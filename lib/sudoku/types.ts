export type Board = number[][];
export type Difficulty = "easy" | "medium" | "hard";

export const SIZE = 9;
export const BOX = 3;

export interface Puzzle {
  puzzle: Board;
  solution: Board;
  difficulty: Difficulty;
}

export interface CellPosition {
  row: number;
  col: number;
}

export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 24,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
