"use client";

import { CheckIcon, LightbulbIcon, PencilIcon, RefreshIcon } from "./icons";

interface GameControlsProps {
  notesMode: boolean;
  onToggleNotes: () => void;
  onHint: () => void;
  onCheck: () => void;
  onNewGame: () => void;
  disabled: boolean;
}

export function GameControls({
  notesMode,
  onToggleNotes,
  onHint,
  onCheck,
  onNewGame,
  disabled,
}: GameControlsProps) {
  return (
    <div className="game-controls">
      <button
        type="button"
        className={`control-btn ${notesMode ? "control-btn--active" : ""}`}
        onClick={onToggleNotes}
        disabled={disabled}
        aria-pressed={notesMode}
        title="Notes mode"
      >
        <PencilIcon className="h-5 w-5" />
        <span className="control-btn__label">Notes</span>
      </button>
      <button
        type="button"
        className="control-btn"
        onClick={onHint}
        disabled={disabled}
        title="Reveal a hint"
      >
        <LightbulbIcon className="h-5 w-5" />
        <span className="control-btn__label">Hint</span>
      </button>
      <button
        type="button"
        className="control-btn control-btn--accent"
        onClick={onCheck}
        disabled={disabled}
        title="Check solution"
      >
        <CheckIcon className="h-5 w-5" />
        <span className="control-btn__label">Check</span>
      </button>
      <button
        type="button"
        className="control-btn"
        onClick={onNewGame}
        title="New game"
      >
        <RefreshIcon className="h-5 w-5" />
        <span className="control-btn__label">New</span>
      </button>
    </div>
  );
}
