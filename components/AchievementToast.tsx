"use client";

import { getAchievementDef, type AchievementId } from "@/lib/storage";

interface AchievementToastProps {
  ids: AchievementId[];
}

export function AchievementToast({ ids }: AchievementToastProps) {
  if (ids.length === 0) return null;

  return (
    <div className="achievement-toast-wrap" role="status">
      {ids.map((id) => {
        const def = getAchievementDef(id);
        if (!def) return null;
        return (
          <div key={id} className="achievement-toast">
            <span className="achievement-toast__emoji">{def.emoji}</span>
            <div>
              <p className="achievement-toast__title">Achievement unlocked!</p>
              <p className="achievement-toast__name">{def.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
