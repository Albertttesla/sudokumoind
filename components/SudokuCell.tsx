"use client";

import type { NotesGrid } from "@/lib/game/types";

interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  notes: Set<number>;
  isSelected: boolean;
  isRelated: boolean;
  isSameValue: boolean;
  isFixed: boolean;
  isConflict: boolean;
  isHinted: boolean;
  isPop: boolean;
  thickRight: boolean;
  thickBottom: boolean;
  onSelect: (row: number, col: number) => void;
}

export function SudokuCell({
  row,
  col,
  value,
  notes,
  isSelected,
  isRelated,
  isSameValue,
  isFixed,
  isConflict,
  isHinted,
  isPop,
  thickRight,
  thickBottom,
  onSelect,
}: SudokuCellProps) {
  const noteList = Array.from(notes).sort((a, b) => a - b);

  const classes = [
    "sudoku-cell",
    isSelected && "sudoku-cell--selected",
    isRelated && !isSelected && "sudoku-cell--related",
    isSameValue && value !== 0 && "sudoku-cell--same-value",
    isFixed && "sudoku-cell--fixed",
    !isFixed && value !== 0 && !isConflict && "sudoku-cell--user",
    isConflict && "sudoku-cell--conflict",
    isHinted && "sudoku-cell--hinted",
    isPop && "sudoku-cell--pop",
    thickRight && "sudoku-cell--thick-right",
    thickBottom && "sudoku-cell--thick-bottom",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onSelect(row, col)}
      aria-label={`Row ${row + 1}, column ${col + 1}${value ? `, value ${value}` : ", empty"}`}
      aria-pressed={isSelected}
    >
      {value !== 0 ? (
        <span className="sudoku-cell__value">{value}</span>
      ) : noteList.length > 0 ? (
        <span className="sudoku-cell__notes" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => {
            const n = i + 1;
            return (
              <span key={n} className="sudoku-cell__note">
                {noteList.includes(n) ? n : ""}
              </span>
            );
          })}
        </span>
      ) : null}
    </button>
  );
}

export type { NotesGrid };
