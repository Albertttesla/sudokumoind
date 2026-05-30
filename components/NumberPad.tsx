"use client";

interface NumberPadProps {
  onNumber: (n: number) => void;
  onClear: () => void;
  disabled: boolean;
  completedNumbers: Set<number>;
}

export function NumberPad({
  onNumber,
  onClear,
  disabled,
  completedNumbers,
}: NumberPadProps) {
  return (
    <div className="number-pad">
      <div className="number-pad__grid">
        {Array.from({ length: 9 }, (_, i) => {
          const n = i + 1;
          const done = completedNumbers.has(n);
          return (
            <button
              key={n}
              type="button"
              className={`number-pad__btn ${done ? "number-pad__btn--done" : ""}`}
              onClick={() => onNumber(n)}
              disabled={disabled || done}
              aria-label={`Enter ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="number-pad__clear"
        onClick={onClear}
        disabled={disabled}
        aria-label="Clear cell"
      >
        Clear
      </button>
    </div>
  );
}
