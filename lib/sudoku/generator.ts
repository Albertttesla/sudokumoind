import { DIFFICULTY_CLUES, type Board, type Difficulty, type Puzzle } from "./types";
import { cloneBoard, createEmptyBoard } from "./utils";
import { isValidPlacement } from "./validation";
import { createSeededRandom, type SeededRandom } from "./rng";

function shuffle<T>(arr: T[], random: SeededRandom): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillBox(board: Board, row: number, col: number, random: SeededRandom): void {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      board[row + r][col + c] = nums[idx++];
    }
  }
}

function solveBoard(board: Board, random: SeededRandom): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;
      const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
      for (const num of candidates) {
        if (!isValidPlacement(board, row, col, num)) continue;
        board[row][col] = num;
        if (solveBoard(board, random)) return true;
        board[row][col] = 0;
      }
      return false;
    }
  }
  return true;
}

function generateFullSolution(random: SeededRandom): Board {
  const board = createEmptyBoard();
  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box, random);
  }
  solveBoard(board, random);
  return board;
}

function countSolutions(board: Board, limit = 2): number {
  const working = cloneBoard(board);
  let count = 0;

  function backtrack(): void {
    if (count >= limit) return;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (working[row][col] !== 0) continue;
        for (let num = 1; num <= 9; num++) {
          if (!isValidPlacement(working, row, col, num)) continue;
          working[row][col] = num;
          backtrack();
          working[row][col] = 0;
          if (count >= limit) return;
        }
        return;
      }
    }
    count++;
  }

  backtrack();
  return count;
}

function carvePuzzle(solution: Board, clueCount: number, random: SeededRandom): Board {
  const puzzle = cloneBoard(solution);
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({
      row: Math.floor(i / 9),
      col: i % 9,
    })),
    random,
  );

  let removed = 0;
  const targetRemove = 81 - clueCount;

  for (const { row, col } of positions) {
    if (removed >= targetRemove) break;
    if (puzzle[row][col] === 0) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const solutions = countSolutions(puzzle, 2);
    if (solutions === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
}

export function generatePuzzle(
  difficulty: Difficulty,
  random: SeededRandom = createSeededRandom((Math.random() * 2 ** 32) >>> 0),
): Puzzle {
  const solution = generateFullSolution(random);
  const clueCount = DIFFICULTY_CLUES[difficulty];
  const puzzle = carvePuzzle(solution, clueCount, random);

  return {
    puzzle,
    solution: cloneBoard(solution),
    difficulty,
  };
}
