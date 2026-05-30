import { generatePuzzle } from "./generator";
import { createSeededRandom, hashString } from "./rng";
import type { Puzzle } from "./types";

export const DAILY_DIFFICULTY = "medium" as const;

/** Local calendar date as YYYY-MM-DD. */
export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateKeyDisplay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Same puzzle for everyone on a given calendar day. */
export function generateDailyPuzzle(dateKey = getTodayDateKey()): Puzzle & { dateKey: string } {
  const seed = hashString(`sudokumind-daily-${dateKey}`);
  const random = createSeededRandom(seed);
  const puzzle = generatePuzzle(DAILY_DIFFICULTY, random);
  return { ...puzzle, dateKey };
}
