import { getTodayDateKey } from "@/lib/sudoku/daily";
import { STORAGE_KEYS } from "./keys";

export interface StreakData {
  currentStreak: number;
  lastPlayedDate: string | null;
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  lastPlayedDate: null,
};

function loadRaw(): StreakData {
  if (typeof window === "undefined") return { ...DEFAULT_STREAK };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.streak);
    if (!raw) return { ...DEFAULT_STREAK };
    return { ...DEFAULT_STREAK, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

function save(data: StreakData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(data));
}

export function loadStreak(): StreakData {
  return loadRaw();
}

function previousDayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return getTodayDateKey(date);
}

/** Call when user opens or plays a game today. Updates streak. */
export function recordPlayDay(): StreakData {
  const today = getTodayDateKey();
  const data = loadRaw();

  if (data.lastPlayedDate === today) {
    return data;
  }

  if (data.lastPlayedDate === previousDayKey(today)) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }

  data.lastPlayedDate = today;
  save(data);
  return data;
}
