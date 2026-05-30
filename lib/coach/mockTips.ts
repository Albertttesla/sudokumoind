import type { Board } from "@/lib/sudoku";

export interface CoachTip {
  label: string;
  body: string;
  technique?: string;
}

const TIPS: CoachTip[] = [
  {
    label: "Strategy Tip",
    body: "Look at row 3 — only one cell can contain the number 7. This technique is called \"Last Remaining Cell\". Try scanning each row and column for numbers that have only one possible position!",
    technique: "Last Remaining Cell",
  },
  {
    label: "Strategy Tip",
    body: "Box 5 is missing only the number 4. When a 3×3 box has eight digits placed, the empty cell must take the remaining digit — fill it in and watch the row and column unlock new possibilities.",
    technique: "Box Completion",
  },
  {
    label: "Strategy Tip",
    body: "Number 9 appears in rows 1, 4, and 7 in this box. That leaves a single cell in the center column where 9 can legally go. Mark it mentally, then confirm no row or column conflicts.",
    technique: "Hidden Single",
  },
  {
    label: "Strategy Tip",
    body: "Column 6 has only two empty cells, and both can only be 2 or 5. Check the intersecting boxes — one of those cells is restricted to just 2. Place it there first; the column will solve itself.",
    technique: "Narrowing Candidates",
  },
  {
    label: "Strategy Tip",
    body: "You're close on the bottom-right box. Cross-check which digits 1–9 are already used in that box, then eliminate any number that already appears in the same row or column of each empty cell.",
    technique: "Elimination Scan",
  },
];

function findHighlightRow(board: Board): number {
  let bestRow = 3;
  let bestScore = -1;
  for (let r = 0; r < 9; r++) {
    const filled = board[r].filter((n) => n !== 0).length;
    if (filled > bestScore && filled >= 4 && filled <= 7) {
      bestScore = filled;
      bestRow = r + 1;
    }
  }
  return bestRow;
}

function personalizeTip(tip: CoachTip, board: Board): CoachTip {
  if (!tip.body.includes("row 3")) return tip;
  const row = findHighlightRow(board);
  return {
    ...tip,
    body: tip.body.replace("row 3", `row ${row}`),
  };
}

let tipIndex = 0;

export function getNextMockTip(board: Board): CoachTip {
  const tip = TIPS[tipIndex % TIPS.length];
  tipIndex += 1;
  return personalizeTip(tip, board);
}

export function getDefaultMockTip(board: Board): CoachTip {
  return personalizeTip(TIPS[0], board);
}

const LOADING_MS_MIN = 1400;
const LOADING_MS_MAX = 2200;

export function mockCoachDelay(): Promise<void> {
  const ms = LOADING_MS_MIN + Math.random() * (LOADING_MS_MAX - LOADING_MS_MIN);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const LOADING_PHASES = [
  "Reading your board…",
  "Scanning rows and columns…",
  "Checking 3×3 boxes…",
  "Finding the best strategy…",
] as const;
