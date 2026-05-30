import { BOX, SIZE, type Board, type CellPosition } from "./types";

export function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseCellKey(key: string): CellPosition {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

export function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / BOX) * BOX + Math.floor(col / BOX);
}

export function boardsEqual(a: Board, b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export function isBoardComplete(board: Board): boolean {
  return board.every((row) => row.every((n) => n !== 0));
}
