"use client";

import { useMemo, useState } from "react";
import { useClient } from "@/hooks/useClient";
import { formatDateKeyDisplay, getTodayDateKey } from "@/lib/sudoku/daily";
import {
  formatSeconds,
  getLeaderboardForDate,
  getPlayerName,
  getUserBestForDate,
  setPlayerName,
} from "@/lib/storage";

export function LeaderboardPage() {
  const isClient = useClient();
  const dateKey = getTodayDateKey();
  const [name, setName] = useState(() =>
    typeof window !== "undefined" ? getPlayerName() : "Player",
  );
  const [savedHint, setSavedHint] = useState(false);
  const [version, setVersion] = useState(0);

  const entries = useMemo(() => {
    if (!isClient) return [];
    void version;
    return getLeaderboardForDate(dateKey);
  }, [isClient, dateKey, version]);

  const handleSaveName = () => {
    setPlayerName(name);
    setSavedHint(true);
    setVersion((v) => v + 1);
    setTimeout(() => setSavedHint(false), 2000);
  };

  const userBest = isClient ? getUserBestForDate(dateKey) : null;
  const playerName = isClient ? getPlayerName() : name;

  return (
    <div className="page-shell">
      <header className="page-header">
        <h2 className="page-title">Daily Leaderboard</h2>
        <p className="page-desc">{formatDateKeyDisplay(dateKey)}</p>
        <p className="page-desc text-sm">Top 10 fastest times · stored on this device</p>
      </header>

      <div className="name-card">
        <label htmlFor="player-name" className="name-card__label">
          Your display name
        </label>
        <div className="name-card__row">
          <input
            id="player-name"
            type="text"
            className="name-card__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Player"
          />
          <button type="button" className="overlay-btn name-card__btn" onClick={handleSaveName}>
            Save
          </button>
        </div>
        {savedHint && <p className="name-card__saved">Name saved!</p>}
      </div>

      {userBest && (
        <div className="user-best-banner">
          Your best today: <strong className="tabular-nums">{formatSeconds(userBest.timeSeconds)}</strong>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>No times yet today.</p>
          <p className="text-muted text-sm">Complete the Daily Challenge to claim a spot!</p>
        </div>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((entry, index) => {
            const isYou = entry.playerName === playerName;
            return (
              <li
                key={`${entry.completedAt}-${index}`}
                className={`leaderboard-row ${isYou ? "leaderboard-row--you" : ""} ${index < 3 ? `leaderboard-row--rank-${index + 1}` : ""}`}
              >
                <span className="leaderboard-row__rank">{index + 1}</span>
                <span className="leaderboard-row__name">{entry.playerName}</span>
                <span className="leaderboard-row__time tabular-nums">
                  {formatSeconds(entry.timeSeconds)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
