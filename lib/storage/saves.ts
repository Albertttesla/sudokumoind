import type { NotesGrid } from "@/lib/game/types";
import type { Board, Difficulty } from "@/lib/sudoku";
import { getTodayDateKey } from "@/lib/sudoku/daily";
import { STORAGE_KEYS } from "./keys";
import { deserializeNotes, serializeNotes } from "./notes";
import type { GameMode, SavedGameProgress } from "./types";

function storageKey(mode: GameMode): string {
  return mode === "regular" ? STORAGE_KEYS.regularSave : STORAGE_KEYS.dailySave;
}

export function loadSavedGame(mode: GameMode): SavedGameProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(mode));
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedGameProgress;
    if (data.mode !== mode) return null;
    if (mode === "daily" && data.dateKey !== getTodayDateKey()) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveGameProgress(progress: SavedGameProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(progress.mode), JSON.stringify(progress));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function clearSavedGame(mode: GameMode): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(mode));
}

export interface BuildSaveParams {
  mode: GameMode;
  difficulty: Difficulty;
  dateKey?: string;
  initial: Board;
  board: Board;
  solution: Board;
  notes: NotesGrid;
  elapsed: number;
  mistakes: number;
  status: SavedGameProgress["status"];
  hintsUsed: number;
  notesMode: boolean;
  selected: { row: number; col: number } | null;
}

export function buildSavePayload(params: BuildSaveParams): SavedGameProgress {
  return {
    ...params,
    notes: serializeNotes(params.notes),
    savedAt: Date.now(),
  };
}

export function applySavedNotes(progress: SavedGameProgress): NotesGrid {
  return deserializeNotes(progress.notes);
}
