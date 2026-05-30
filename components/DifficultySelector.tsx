"use client";

import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/sudoku";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

export function DifficultySelector({
  value,
  onChange,
  disabled,
}: DifficultySelectorProps) {
  return (
    <div className="difficulty-selector" role="group" aria-label="Difficulty">
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={`difficulty-btn ${value === level ? "difficulty-btn--active" : ""}`}
          onClick={() => onChange(level)}
          disabled={disabled}
          aria-pressed={value === level}
        >
          {DIFFICULTY_LABELS[level]}
        </button>
      ))}
    </div>
  );
}
