import { STORAGE_KEYS } from "./keys";
import type { LeaderboardEntry } from "./types";

const MAX_ENTRIES = 10;

export function getPlayerName(): string {
  if (typeof window === "undefined") return "Player";
  return localStorage.getItem(STORAGE_KEYS.playerName)?.trim() || "Player";
}

export function setPlayerName(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim() || "Player";
  localStorage.setItem(STORAGE_KEYS.playerName, trimmed);
}

function loadAllEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.leaderboard);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

function saveAllEntries(entries: LeaderboardEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(entries));
}

export function getLeaderboardForDate(dateKey: string): LeaderboardEntry[] {
  return loadAllEntries()
    .filter((e) => e.dateKey === dateKey)
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .slice(0, MAX_ENTRIES);
}

export function addLeaderboardEntry(
  dateKey: string,
  timeSeconds: number,
  playerName = getPlayerName(),
): LeaderboardEntry[] {
  const all = loadAllEntries();
  const entry: LeaderboardEntry = {
    playerName,
    timeSeconds,
    dateKey,
    completedAt: Date.now(),
  };

  const forDate = all.filter((e) => e.dateKey === dateKey);
  const otherDates = all.filter((e) => e.dateKey !== dateKey);
  const existing = forDate.find((e) => e.playerName === playerName);

  if (existing && timeSeconds >= existing.timeSeconds) {
    return forDate.sort((a, b) => a.timeSeconds - b.timeSeconds).slice(0, MAX_ENTRIES);
  }

  const withoutPlayer = forDate.filter((e) => e.playerName !== playerName);
  const merged = [...withoutPlayer, entry]
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .slice(0, MAX_ENTRIES);

  saveAllEntries([...otherDates, ...merged]);
  return merged;
}

export function getUserBestForDate(dateKey: string): LeaderboardEntry | null {
  const name = getPlayerName();
  const entries = getLeaderboardForDate(dateKey);
  return entries.find((e) => e.playerName === name) ?? null;
}
