import { BOX, SIZE, type Board } from "./types";
import { cellKey } from "./utils";

export function isValidPlacement(
  board: Board,
  row: number,
  col: number,
  num: number,
  ignoreCell = true,
): boolean {
  if (num < 1 || num > 9) return false;

  for (let c = 0; c < SIZE; c++) {
    if (ignoreCell && c === col) continue;
    if (board[row][c] === num) return false;
  }

  for (let r = 0; r < SIZE; r++) {
    if (ignoreCell && r === row) continue;
    if (board[r][col] === num) return false;
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if (ignoreCell && r === row && c === col) continue;
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

/** Returns keys of all cells involved in rule violations (duplicates in row/col/box). */
export function getConflictKeys(board: Board): Set<string> {
  const conflicts = new Set<string>();

  const markGroup = (cells: { row: number; col: number; value: number }[]) => {
    const byValue = new Map<number, { row: number; col: number }[]>();
    for (const cell of cells) {
      if (cell.value === 0) continue;
      const list = byValue.get(cell.value) ?? [];
      list.push({ row: cell.row, col: cell.col });
      byValue.set(cell.value, list);
    }
    for (const positions of byValue.values()) {
      if (positions.length > 1) {
        for (const { row, col } of positions) {
          conflicts.add(cellKey(row, col));
        }
      }
    }
  };

  for (let r = 0; r < SIZE; r++) {
    markGroup(
      Array.from({ length: SIZE }, (_, c) => ({
        row: r,
        col: c,
        value: board[r][c],
      })),
    );
  }

  for (let c = 0; c < SIZE; c++) {
    markGroup(
      Array.from({ length: SIZE }, (_, r) => ({
        row: r,
        col: c,
        value: board[r][c],
      })),
    );
  }

  for (let br = 0; br < SIZE; br += BOX) {
    for (let bc = 0; bc < SIZE; bc += BOX) {
      const cells: { row: number; col: number; value: number }[] = [];
      for (let r = br; r < br + BOX; r++) {
        for (let c = bc; c < bc + BOX; c++) {
          cells.push({ row: r, col: c, value: board[r][c] });
        }
      }
      markGroup(cells);
    }
  }

  return conflicts;
}

export function isBoardValid(board: Board): boolean {
  return getConflictKeys(board).size === 0 && board.every((row) => row.every((n) => n !== 0));
}
