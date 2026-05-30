"use client";

import { useState } from "react";
import { recordPlayDay } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";

interface GameHeaderProps {
  time: string;
  mistakes: number;
  maxMistakes: number;
  difficultyLabel: string;
  subtitle?: string;
  onOpenPro: () => void;
}

export function GameHeader({
  time,
  mistakes,
  maxMistakes,
  difficultyLabel,
  subtitle,
  onOpenPro,
}: GameHeaderProps) {
  const [streak] = useState(() =>
    typeof window !== "undefined" ? recordPlayDay().currentStreak : 0,
  );

  return (
    <header className="hero-header">
      <div className="hero-header__gradient">
        <div className="hero-header__top">
          <div className="hero-header__brand">
            <h1 className="hero-header__title">SudokuMind</h1>
            <div className="hero-header__meta">
              <span className="hero-header__badge">{difficultyLabel}</span>
              {streak > 0 && (
                <span className="streak-pill" title="Day streak">
                  🔥 {streak} day{streak !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {subtitle && <p className="hero-header__subtitle">{subtitle}</p>}
          </div>
          <div className="hero-header__actions">
            <button type="button" className="btn-pro" onClick={onOpenPro}>
              Upgrade to Pro
            </button>
            <ThemeToggle />
          </div>
        </div>
        <div className="hero-header__stats">
          <div className="stat-pill stat-pill--glass">
            <span className="stat-pill__label">Time</span>
            <span className="stat-pill__value tabular-nums">{time}</span>
          </div>
          <div className="stat-pill stat-pill--glass">
            <span className="stat-pill__label">Mistakes</span>
            <span className="stat-pill__value">
              <span className={mistakes >= maxMistakes - 1 ? "text-danger" : ""}>
                {mistakes}
              </span>
              <span className="stat-pill__muted"> / {maxMistakes}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
