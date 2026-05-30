"use client";

import type { Board } from "@/lib/sudoku";
import type { NotesGrid } from "@/lib/game/types";
import { SudokuCell } from "./SudokuCell";

interface SudokuGridProps {
  board: Board;
  notes: NotesGrid;
  selected: { row: number; col: number } | null;
  conflicts: Set<string>;
  fixedCells: Set<string>;
  lastPop: string | null;
  onSelect: (row: number, col: number) => void;
}

export function SudokuGrid({
  board,
  notes,
  selected,
  conflicts,
  fixedCells,
  lastPop,
  onSelect,
}: SudokuGridProps) {
  const selRow = selected?.row ?? -1;
  const selCol = selected?.col ?? -1;
  const selBoxRow = Math.floor(selRow / 3) * 3;
  const selBoxCol = Math.floor(selCol / 3) * 3;
  const selectedValue = selRow >= 0 ? board[selRow][selCol] : 0;

  return (
    <div className="sudoku-grid" role="grid" aria-label="Sudoku board">
      {board.map((row, r) =>
        row.map((value, c) => {
          const key = `${r},${c}`;
          const inSameRow = r === selRow;
          const inSameCol = c === selCol;
          const inSameBox =
            r >= selBoxRow &&
            r < selBoxRow + 3 &&
            c >= selBoxCol &&
            c < selBoxCol + 3;
          const isRelated = inSameRow || inSameCol || inSameBox;
          const isSameValue = value !== 0 && value === selectedValue;

          return (
            <SudokuCell
              key={key}
              row={r}
              col={c}
              value={value}
              notes={notes[r][c]}
              isSelected={r === selRow && c === selCol}
              isRelated={isRelated && selRow >= 0}
              isSameValue={isSameValue}
              isFixed={fixedCells.has(key)}
              isConflict={conflicts.has(key)}
              isHinted={false}
              isPop={lastPop === key}
              thickRight={(c + 1) % 3 === 0 && c < 8}
              thickBottom={(r + 1) % 3 === 0 && r < 8}
              onSelect={onSelect}
            />
          );
        }),
      )}
    </div>
  );
}
