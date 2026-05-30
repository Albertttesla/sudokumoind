"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "@/hooks/useClient";
import { useSudokuGame } from "@/hooks/useSudokuGame";
import { formatDateKeyDisplay } from "@/lib/sudoku/daily";
import type { Difficulty } from "@/lib/sudoku";
import type { AchievementId, GameMode } from "@/lib/storage";
import { AchievementToast } from "./AchievementToast";
import { AICoachModal } from "./AICoachModal";
import { DifficultySelector } from "./DifficultySelector";
import { GameControls } from "./GameControls";
import { GameHeader } from "./GameHeader";
import { NumberPad } from "./NumberPad";
import { ProModal } from "./ProModal";
import { SudokuGrid } from "./SudokuGrid";

interface SudokuGameProps {
  mode: GameMode;
}

function GameSkeleton() {
  return (
    <div className="game-shell">
      <div className="game-skeleton" aria-hidden>
        <div className="game-skeleton__header" />
        <div className="game-skeleton__board" />
      </div>
    </div>
  );
}

function SudokuGameInner({ mode }: SudokuGameProps) {
  const [proOpen, setProOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementId[]>([]);

  const game = useSudokuGame({
    mode,
    onWin: ({ newAchievements: ids }) => {
      if (ids.length > 0) setNewAchievements(ids);
    },
  });

  const disabled = game.status !== "playing";

  useEffect(() => {
    if (newAchievements.length === 0) return;
    const t = setTimeout(() => setNewAchievements([]), 5000);
    return () => clearTimeout(t);
  }, [newAchievements]);

  const completedNumbers = useMemo(() => {
    const counts = new Map<number, number>();
    for (let n = 1; n <= 9; n++) counts.set(n, 0);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = game.board[r][c];
        if (v > 0) counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
    const done = new Set<number>();
    for (let n = 1; n <= 9; n++) {
      if ((counts.get(n) ?? 0) >= 9) done.add(n);
    }
    return done;
  }, [game.board]);

  const handleDifficulty = useCallback(
    (d: Difficulty) => {
      game.setDifficulty(d);
    },
    [game],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;

      if (key >= "1" && key <= "9") {
        e.preventDefault();
        game.placeNumber(Number(key));
        return;
      }

      if (key === "Backspace" || key === "Delete" || key === "0") {
        e.preventDefault();
        game.clearCell();
        return;
      }

      if (key === "n" || key === "N") {
        e.preventDefault();
        game.toggleNotesMode();
        return;
      }

      if (key === "ArrowUp") {
        e.preventDefault();
        game.moveSelection(-1, 0);
        return;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        game.moveSelection(1, 0);
        return;
      }
      if (key === "ArrowLeft") {
        e.preventDefault();
        game.moveSelection(0, -1);
        return;
      }
      if (key === "ArrowRight") {
        e.preventDefault();
        game.moveSelection(0, 1);
        return;
      }

      if (key === "h" || key === "H") {
        if (!disabled) {
          e.preventDefault();
          game.giveHint();
        }
      }
    },
    [game, disabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="game-shell">
      <GameHeader
        time={game.formatTime()}
        mistakes={game.mistakes}
        maxMistakes={game.maxMistakes}
        difficultyLabel={game.difficultyLabel}
        subtitle={game.isDaily ? formatDateKeyDisplay(game.dateKey) : undefined}
        onOpenPro={() => setProOpen(true)}
      />

      <AchievementToast ids={newAchievements} />

      {!game.isDaily && (
        <DifficultySelector
          value={game.difficulty}
          onChange={handleDifficulty}
          disabled={false}
        />
      )}

      {game.isDaily && (
        <p className="daily-banner">
          One puzzle for everyone today · Medium difficulty
        </p>
      )}

      <div className="game-board-wrap">
        <SudokuGrid
          board={game.board}
          notes={game.notes}
          selected={game.selected}
          conflicts={game.conflicts}
          fixedCells={game.fixedCells}
          lastPop={game.lastPop}
          onSelect={game.selectCell}
        />

        {game.status === "won" && (
          <div className="game-overlay game-overlay--win" role="alert">
            <div className="game-overlay__card">
              <h2>{game.isDaily ? "Daily Complete!" : "Puzzle Solved!"}</h2>
              <p>Time: {game.formatTime()}</p>
              <p>Hints used: {game.hintsUsed}</p>
              {newAchievements.length > 0 && (
                <p className="text-sm">New achievements unlocked — check Stats!</p>
              )}
              {game.isDaily && (
                <p className="text-muted text-sm">
                  Your time was saved to today&apos;s leaderboard.
                </p>
              )}
              <button
                type="button"
                className="overlay-btn"
                onClick={() => game.startNewGame()}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {game.status === "lost" && (
          <div className="game-overlay game-overlay--lose" role="alert">
            <div className="game-overlay__card">
              <h2>Game Over</h2>
              <p>3 mistakes reached. Better luck next time!</p>
              <button
                type="button"
                className="overlay-btn"
                onClick={() => game.startNewGame()}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {game.checkMessage && (
        <p
          className={`check-message ${game.checkMessage.includes("Perfect") ? "check-message--success" : ""}`}
          role="status"
        >
          {game.checkMessage}
        </p>
      )}

      <button
        type="button"
        className="btn-coach"
        onClick={() => setCoachOpen(true)}
        disabled={disabled}
      >
        <span className="btn-coach__icon">🧠</span>
        AI Coach
      </button>

      <GameControls
        notesMode={game.notesMode}
        onToggleNotes={game.toggleNotesMode}
        onHint={() => game.giveHint()}
        onCheck={() => game.checkSolution()}
        onNewGame={() => game.startNewGame()}
        disabled={disabled}
      />

      <NumberPad
        onNumber={game.placeNumber}
        onClear={game.clearCell}
        disabled={disabled}
        completedNumbers={completedNumbers}
      />

      <p className="keyboard-hint">
        Arrow keys · 1–9 · N notes · H hint
      </p>

      <ProModal open={proOpen} onClose={() => setProOpen(false)} />
      {coachOpen && (
        <AICoachModal
          onClose={() => setCoachOpen(false)}
          board={game.board}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export function SudokuGame({ mode }: SudokuGameProps) {
  const isClient = useClient();
  if (!isClient) return <GameSkeleton />;
  return <SudokuGameInner mode={mode} />;
}
