"use client";

import { useState } from "react";
import { Navigation, type AppView } from "./Navigation";
import { SudokuGame } from "./SudokuGame";
import { StatsPage } from "./StatsPage";
import { LeaderboardPage } from "./LeaderboardPage";

export function AppShell() {
  const [view, setView] = useState<AppView>("regular");

  return (
    <div className="app-shell">
      <div className="app-shell__content">
        {view === "regular" && <SudokuGame key="regular" mode="regular" />}
        {view === "daily" && <SudokuGame key="daily" mode="daily" />}
        {view === "stats" && <StatsPage />}
        {view === "leaderboard" && <LeaderboardPage />}
      </div>
      <Navigation active={view} onChange={setView} />
    </div>
  );
}
