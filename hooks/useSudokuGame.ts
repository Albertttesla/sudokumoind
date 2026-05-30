"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameStatus, NotesGrid } from "@/lib/game/types";
import {
  DIFFICULTY_LABELS,
  generatePuzzle,
  getConflictKeys,
  isBoardComplete,
  type Board,
  type Difficulty,
} from "@/lib/sudoku";
import {
  DAILY_DIFFICULTY,
  generateDailyPuzzle,
  getTodayDateKey,
} from "@/lib/sudoku/daily";
import { cloneBoard } from "@/lib/sudoku/utils";
import {
  addLeaderboardEntry,
  applySavedNotes,
  buildSavePayload,
  clearSavedGame,
  evaluateWinAchievements,
  loadSavedGame,
  loadStats,
  recordDailyWin,
  recordRegularResult,
  saveGameProgress,
  type AchievementId,
  type GameMode,
} from "@/lib/storage";

export type { GameStatus, NotesGrid };

const MAX_MISTAKES = 3;
const SAVE_DEBOUNCE_MS = 400;

interface PuzzleSnapshot {
  difficulty: Difficulty;
  initial: Board;
  board: Board;
  solution: Board;
  dateKey?: string;
}

function createNotesGrid(): NotesGrid {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>()),
  );
}

function cloneNotes(notes: NotesGrid): NotesGrid {
  return notes.map((row) => row.map((set) => new Set(set)));
}

function createRegularSnapshot(difficulty: Difficulty): PuzzleSnapshot {
  const generated = generatePuzzle(difficulty);
  return {
    difficulty,
    initial: cloneBoard(generated.puzzle),
    board: cloneBoard(generated.puzzle),
    solution: cloneBoard(generated.solution),
  };
}

function createDailySnapshot(dateKey = getTodayDateKey()): PuzzleSnapshot {
  const generated = generateDailyPuzzle(dateKey);
  return {
    difficulty: DAILY_DIFFICULTY,
    initial: cloneBoard(generated.puzzle),
    board: cloneBoard(generated.puzzle),
    solution: cloneBoard(generated.solution),
    dateKey: generated.dateKey,
  };
}

function snapshotFromSave(save: ReturnType<typeof loadSavedGame>): PuzzleSnapshot | null {
  if (!save) return null;
  return {
    difficulty: save.difficulty,
    initial: cloneBoard(save.initial),
    board: cloneBoard(save.board),
    solution: cloneBoard(save.solution),
    dateKey: save.dateKey,
  };
}

export interface CheckResult {
  correct: boolean;
  message: string;
}

export interface WinPayload {
  newAchievements: AchievementId[];
  elapsed: number;
}

export interface UseSudokuGameOptions {
  mode: GameMode;
  onWin?: (payload: WinPayload) => void;
}

function getInitialState(mode: GameMode): {
  puzzle: PuzzleSnapshot;
  notes: NotesGrid;
  mistakes: number;
  status: GameStatus;
  elapsed: number;
  hintsUsed: number;
  notesMode: boolean;
  selected: { row: number; col: number } | null;
} {
  const saved = typeof window !== "undefined" ? loadSavedGame(mode) : null;
  const puzzle = snapshotFromSave(saved) ?? (mode === "daily" ? createDailySnapshot() : createRegularSnapshot("easy"));

  return {
    puzzle,
    notes: saved ? applySavedNotes(saved) : createNotesGrid(),
    mistakes: saved?.mistakes ?? 0,
    status: saved?.status ?? "playing",
    elapsed: saved?.elapsed ?? 0,
    hintsUsed: saved?.hintsUsed ?? 0,
    notesMode: saved?.notesMode ?? false,
    selected: saved?.selected ?? null,
  };
}

export function useSudokuGame({ mode, onWin }: UseSudokuGameOptions) {
  const [initialized] = useState(() => getInitialState(mode));
  const [puzzle, setPuzzle] = useState<PuzzleSnapshot>(initialized.puzzle);
  const { difficulty, initial, board, solution, dateKey } = puzzle;

  const [notes, setNotes] = useState<NotesGrid>(initialized.notes);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    initialized.selected,
  );
  const [notesMode, setNotesMode] = useState(initialized.notesMode);
  const [mistakes, setMistakes] = useState(initialized.mistakes);
  const [status, setStatus] = useState<GameStatus>(initialized.status);
  const [elapsed, setElapsed] = useState(initialized.elapsed);
  const [hintsUsed, setHintsUsed] = useState(initialized.hintsUsed);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [lastPop, setLastPop] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRecordedRef = useRef(initialized.status !== "playing");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conflicts = useMemo(() => getConflictKeys(board), [board]);
  const isDaily = mode === "daily";
  const todayKey = getTodayDateKey();

  const fixedCells = useMemo(() => {
    const fixed = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (initial[r][c] !== 0) fixed.add(`${r},${c}`);
      }
    }
    return fixed;
  }, [initial]);

  const persistProgress = useCallback(() => {
    if (status === "won" || status === "lost") return;
    saveGameProgress(
      buildSavePayload({
        mode,
        difficulty,
        dateKey: isDaily ? dateKey ?? todayKey : undefined,
        initial,
        board,
        solution,
        notes,
        elapsed,
        mistakes,
        status,
        hintsUsed,
        notesMode,
        selected,
      }),
    );
  }, [
    mode,
    difficulty,
    dateKey,
    todayKey,
    isDaily,
    initial,
    board,
    solution,
    notes,
    elapsed,
    mistakes,
    status,
    hintsUsed,
    notesMode,
    selected,
  ]);

  useEffect(() => {
    if (status !== "playing") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(persistProgress, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [persistProgress, status]);

  useEffect(() => {
    return () => {
      if (status === "playing") persistProgress();
    };
  }, [persistProgress, status]);

  const recordOutcome = useCallback(
    (outcome: "won" | "lost") => {
      if (resultRecordedRef.current) return;
      resultRecordedRef.current = true;
      clearSavedGame(mode);

      if (outcome === "won") {
        const statsBefore = loadStats();
        const totalWinsBefore = statsBefore.wins + statsBefore.dailyWins;

        if (mode === "regular") {
          recordRegularResult(true, difficulty, elapsed);
        } else {
          recordDailyWin();
          addLeaderboardEntry(dateKey ?? todayKey, elapsed);
        }

        const newAchievements = evaluateWinAchievements({
          elapsed,
          mistakes,
          difficulty,
          totalWinsBefore,
        });
        onWin?.({ newAchievements, elapsed });
      } else if (mode === "regular") {
        recordRegularResult(false, difficulty, elapsed);
      }
    },
    [mode, difficulty, elapsed, mistakes, dateKey, todayKey, onWin],
  );

  useEffect(() => {
    if (status === "won") recordOutcome("won");
    if (status === "lost") recordOutcome("lost");
  }, [status, recordOutcome]);

  const resetSession = useCallback(
    (snapshot: PuzzleSnapshot) => {
      setPuzzle(snapshot);
      setNotes(createNotesGrid());
      setSelected(null);
      setNotesMode(false);
      setMistakes(0);
      setStatus("playing");
      setElapsed(0);
      setHintsUsed(0);
      setCheckMessage(null);
      setLastPop(null);
      resultRecordedRef.current = false;
      clearSavedGame(mode);
    },
    [mode],
  );

  const startNewGame = useCallback(
    (diff?: Difficulty) => {
      const snapshot =
        mode === "daily"
          ? createDailySnapshot()
          : createRegularSnapshot(diff ?? puzzle.difficulty);
      resetSession(snapshot);
    },
    [mode, puzzle.difficulty, resetSession],
  );

  const ensureDailyDate = useCallback(() => {
    if (!isDaily) return;
    const current = dateKey ?? todayKey;
    if (current !== getTodayDateKey()) {
      resetSession(createDailySnapshot());
    }
  }, [isDaily, dateKey, todayKey, resetSession]);

  useEffect(() => {
    if (status !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const isFixed = useCallback(
    (row: number, col: number) => fixedCells.has(`${row},${col}`),
    [fixedCells],
  );

  const updateBoard = useCallback((updater: (prev: Board) => Board) => {
    setPuzzle((prev) => {
      const nextBoard = updater(prev.board);
      return { ...prev, board: nextBoard };
    });
  }, []);

  const placeNumber = useCallback(
    (num: number) => {
      ensureDailyDate();
      if (status !== "playing" || !selected) return;
      const { row, col } = selected;
      if (isFixed(row, col)) return;

      if (notesMode) {
        setNotes((prev) => {
          const next = cloneNotes(prev);
          const set = next[row][col];
          if (set.has(num)) set.delete(num);
          else set.add(num);
          return next;
        });
        return;
      }

      const correct = solution[row][col] === num;
      const key = `${row},${col}`;

      setPuzzle((prev) => {
        const nextBoard = cloneBoard(prev.board);
        nextBoard[row][col] = num;
        if (correct && isBoardComplete(nextBoard)) {
          const valid =
            getConflictKeys(nextBoard).size === 0 &&
            nextBoard.every((rowArr, r) =>
              rowArr.every((val, c) => val === prev.solution[r][c]),
            );
          if (valid) setStatus("won");
        }
        return { ...prev, board: nextBoard };
      });

      setNotes((prev) => {
        const next = cloneNotes(prev);
        next[row][col] = new Set();
        return next;
      });
      setLastPop(key);
      setTimeout(() => setLastPop(null), 280);
      setCheckMessage(null);

      if (!correct) {
        setMistakes((m) => {
          const next = m + 1;
          if (next >= MAX_MISTAKES) setStatus("lost");
          return next;
        });
      }
    },
    [status, selected, notesMode, solution, isFixed, ensureDailyDate],
  );

  const clearCell = useCallback(() => {
    ensureDailyDate();
    if (status !== "playing" || !selected) return;
    const { row, col } = selected;
    if (isFixed(row, col)) return;

    if (notesMode) {
      setNotes((prev) => {
        const next = cloneNotes(prev);
        next[row][col] = new Set();
        return next;
      });
      return;
    }

    updateBoard((prev) => {
      const next = cloneBoard(prev);
      next[row][col] = 0;
      return next;
    });
    setCheckMessage(null);
  }, [status, selected, notesMode, isFixed, updateBoard, ensureDailyDate]);

  const giveHint = useCallback(() => {
    ensureDailyDate();
    if (status !== "playing") return false;

    const empty: { row: number; col: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
          if (!isFixed(r, c)) empty.push({ row: r, col: c });
        }
      }
    }

    if (empty.length === 0) return false;
    const pick = empty[Math.floor(Math.random() * empty.length)];
    const { row, col } = pick;
    const num = solution[row][col];

    setPuzzle((prev) => {
      const nextBoard = cloneBoard(prev.board);
      nextBoard[row][col] = num;
      if (
        isBoardComplete(nextBoard) &&
        getConflictKeys(nextBoard).size === 0 &&
        nextBoard.every((rowArr, r) =>
          rowArr.every((val, c) => val === prev.solution[r][c]),
        )
      ) {
        setStatus("won");
      }
      return { ...prev, board: nextBoard };
    });

    setNotes((prev) => {
      const next = cloneNotes(prev);
      next[row][col] = new Set();
      return next;
    });
    setSelected({ row, col });
    setHintsUsed((h) => h + 1);
    setLastPop(`${row},${col}`);
    setTimeout(() => setLastPop(null), 280);
    setCheckMessage(null);

    return true;
  }, [status, board, solution, isFixed, ensureDailyDate]);

  const checkSolution = useCallback((): CheckResult => {
    ensureDailyDate();
    if (getConflictKeys(board).size > 0) {
      const msg = "There are conflicts on the board. Fix the red cells first.";
      setCheckMessage(msg);
      return { correct: false, message: msg };
    }

    const hasEmpty = board.some((row) => row.some((n) => n === 0));
    if (hasEmpty) {
      const msg = "Not finished yet — keep filling the grid!";
      setCheckMessage(msg);
      return { correct: false, message: msg };
    }

    const correct = board.every((row, r) =>
      row.every((val, c) => val === solution[r][c]),
    );

    if (correct) {
      setStatus("won");
      const msg = "Perfect! You solved the puzzle!";
      setCheckMessage(msg);
      return { correct: true, message: msg };
    }

    const msg = "Some numbers are incorrect. Keep trying!";
    setCheckMessage(msg);
    return { correct: false, message: msg };
  }, [board, solution, ensureDailyDate]);

  const moveSelection = useCallback((dRow: number, dCol: number) => {
    ensureDailyDate();
    setSelected((prev) => {
      const row = prev ? Math.max(0, Math.min(8, prev.row + dRow)) : 0;
      const col = prev ? Math.max(0, Math.min(8, prev.col + dCol)) : 0;
      return { row, col };
    });
  }, [ensureDailyDate]);

  const selectCell = useCallback((row: number, col: number) => {
    ensureDailyDate();
    setSelected({ row, col });
    setCheckMessage(null);
  }, [ensureDailyDate]);

  const toggleNotesMode = useCallback(() => {
    setNotesMode((n) => !n);
  }, []);

  const formatTime = useCallback(() => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [elapsed]);

  const setDifficulty = useCallback(
    (d: Difficulty) => {
      if (isDaily) return;
      startNewGame(d);
    },
    [isDaily, startNewGame],
  );

  return {
    mode,
    isDaily,
    dateKey: dateKey ?? todayKey,
    difficulty,
    difficultyLabel: isDaily ? "Daily Challenge" : DIFFICULTY_LABELS[difficulty],
    initial,
    board,
    solution,
    notes,
    selected,
    notesMode,
    mistakes,
    maxMistakes: MAX_MISTAKES,
    status,
    elapsed,
    formatTime,
    hintsUsed,
    conflicts,
    fixedCells,
    checkMessage,
    lastPop,
    startNewGame,
    setDifficulty,
    selectCell,
    placeNumber,
    clearCell,
    giveHint,
    checkSolution,
    moveSelection,
    toggleNotesMode,
    isFixed,
  };
}
