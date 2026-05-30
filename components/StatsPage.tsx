"use client";

import { useMemo, useState } from "react";
import { useClient } from "@/hooks/useClient";
import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/sudoku";
import {
  ACHIEVEMENTS,
  DEFAULT_STATS,
  formatSeconds,
  getUnlockedAchievements,
  getWinRate,
  loadStats,
  loadStreak,
} from "@/lib/storage";

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

export function StatsPage() {
  const isClient = useClient();
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => {
    if (!isClient) {
      return { ...DEFAULT_STATS, bestTimes: { ...DEFAULT_STATS.bestTimes } };
    }
    void refreshKey;
    return loadStats();
  }, [isClient, refreshKey]);

  const winRate = getWinRate(stats);

  const unlocked = useMemo(() => {
    if (!isClient) return new Set<string>();
    void refreshKey;
    return new Set(getUnlockedAchievements());
  }, [isClient, refreshKey]);

  const streak = useMemo(() => {
    if (!isClient) return 0;
    void refreshKey;
    return loadStreak().currentStreak;
  }, [isClient, refreshKey]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h2 className="page-title">Your Stats</h2>
        <p className="page-desc">Regular game performance tracked on this device.</p>
        {isClient && (
          <button
            type="button"
            className="text-sm page-refresh-btn"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Refresh
          </button>
        )}
      </header>

      <div className="stats-grid">
        <div className="stat-card stat-card--highlight">
          <span className="stat-card__value">🔥 {streak}</span>
          <span className="stat-card__label">Day Streak</span>
        </div>
        <div className="stat-card stat-card--highlight">
          <span className="stat-card__value">{stats.gamesPlayed}</span>
          <span className="stat-card__label">Games Played</span>
        </div>
        <div className="stat-card stat-card--highlight">
          <span className="stat-card__value">{winRate}%</span>
          <span className="stat-card__label">Win Rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value stat-card__value--success">{stats.wins}</span>
          <span className="stat-card__label">Wins</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value stat-card__value--danger">{stats.losses}</span>
          <span className="stat-card__label">Losses</span>
        </div>
      </div>

      <section className="page-section">
        <h3 className="section-title">Best Times</h3>
        <ul className="best-times-list">
          {LEVELS.map((level) => (
            <li key={level} className="best-times-row">
              <span>{DIFFICULTY_LABELS[level]}</span>
              <span className="best-times-row__time tabular-nums">
                {formatSeconds(stats.bestTimes[level])}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-section">
        <h3 className="section-title">Achievements</h3>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.id}
              className={`achievement-card ${unlocked.has(a.id) ? "achievement-card--unlocked" : ""}`}
            >
              <span className="achievement-card__emoji">{a.emoji}</span>
              <p className="achievement-card__title">{a.title}</p>
              <p className="achievement-card__desc">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <h3 className="section-title">Daily Challenge</h3>
        <div className="stat-card stat-card--inline">
          <span className="stat-card__label">Daily puzzles completed</span>
          <span className="stat-card__value">{stats.dailyWins}</span>
        </div>
      </section>
    </div>
  );
}
