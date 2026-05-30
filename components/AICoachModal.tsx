"use client";

import { useCallback, useEffect, useState } from "react";
import type { Board } from "@/lib/sudoku";
import {
  getDefaultMockTip,
  getNextMockTip,
  LOADING_PHASES,
  mockCoachDelay,
  type CoachTip,
} from "@/lib/coach/mockTips";

interface AICoachModalProps {
  onClose: () => void;
  board: Board;
  disabled?: boolean;
}

export function AICoachModal({ onClose, board, disabled }: AICoachModalProps) {
  const [tip, setTip] = useState<CoachTip | null>(null);
  const [loading, setLoading] = useState(!disabled);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const loadTip = useCallback(async (isRefresh: boolean) => {
    setLoading(true);
    setTip(null);
    setLoadingPhase(0);

    const phaseInterval = setInterval(() => {
      setLoadingPhase((p) => Math.min(p + 1, LOADING_PHASES.length - 1));
    }, 520);

    await mockCoachDelay();

    clearInterval(phaseInterval);
    setTip(isRefresh ? getNextMockTip(board) : getDefaultMockTip(board));
    setLoading(false);
  }, [board]);

  useEffect(() => {
    if (disabled) return;
    const id = requestAnimationFrame(() => {
      void loadTip(false);
    });
    return () => cancelAnimationFrame(id);
  }, [disabled, loadTip]);

  const handleAskAgain = () => {
    void loadTip(true);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="coach-title">
      <button type="button" className="modal-backdrop__hit" onClick={onClose} aria-label="Close" />
      <div className="modal-card modal-card--coach">
        <div className="modal-card__gradient-bar" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="coach-header">
          <span className="coach-header__icon">🧠</span>
          <h2 id="coach-title" className="modal-card__title">
            AI Coach
          </h2>
        </div>
        <p className="modal-card__subtitle">
          Personalized strategy analysis for your current board
        </p>

        {disabled && (
          <p className="coach-disabled-hint">Start a new game to use AI Coach again.</p>
        )}

        {loading && (
          <div className="coach-loading coach-loading--polished" aria-live="polite">
            <div className="coach-loading__orb">
              <div className="coach-loading__spinner" />
              <span className="coach-loading__brain">🧠</span>
            </div>
            <p className="coach-loading__phase">{LOADING_PHASES[loadingPhase]}</p>
            <div className="coach-loading__dots" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="coach-loading__bar">
              <div className="coach-loading__bar-fill" />
            </div>
          </div>
        )}

        {tip && !loading && (
          <div className="coach-tip coach-tip--polished">
            <div className="coach-tip__header">
              <span className="coach-tip__icon" aria-hidden>
                💡
              </span>
              <span className="coach-tip__label">{tip.label}</span>
            </div>
            <p className="coach-tip__body">{tip.body}</p>
            {tip.technique && (
              <span className="coach-tip__technique">{tip.technique}</span>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gradient"
            onClick={handleAskAgain}
            disabled={loading || disabled}
          >
            {loading ? "Analyzing…" : "New tip"}
          </button>
        </div>
      </div>
    </div>
  );
}
