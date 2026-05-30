import type { Board } from "./types";

/** Text representation for AI coach (givens in brackets, empty as .). */
export function formatBoardForCoach(board: Board, initial: Board): string {
  const lines: string[] = [];
  for (let r = 0; r < 9; r++) {
    let line = "";
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (initial[r][c] !== 0) line += `[${v}]`;
      else if (v === 0) line += ".";
      else line += String(v);
      if (c < 8) line += " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}
