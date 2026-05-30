"use client";

export type AppView = "regular" | "daily" | "stats" | "leaderboard";

interface NavigationProps {
  active: AppView;
  onChange: (view: AppView) => void;
}

const NAV_ITEMS: { id: AppView; label: string; short: string }[] = [
  { id: "regular", label: "Play", short: "Play" },
  { id: "daily", label: "Daily", short: "Daily" },
  { id: "stats", label: "Stats", short: "Stats" },
  { id: "leaderboard", label: "Leaderboard", short: "Board" },
];

export function Navigation({ active, onChange }: NavigationProps) {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`app-nav__item ${active === item.id ? "app-nav__item--active" : ""}`}
          onClick={() => onChange(item.id)}
          aria-current={active === item.id ? "page" : undefined}
        >
          <NavIcon view={item.id} active={active === item.id} />
          <span className="app-nav__label">{item.label}</span>
          <span className="app-nav__label-short">{item.short}</span>
        </button>
      ))}
    </nav>
  );
}

function NavIcon({ view, active }: { view: AppView; active: boolean }) {
  const className = `app-nav__icon ${active ? "app-nav__icon--active" : ""}`;
  switch (view) {
    case "regular":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      );
    case "daily":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "stats":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-6 4 3 5-8" />
        </svg>
      );
    case "leaderboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 21h8M12 17V7" />
          <path d="M5 10h4v4H5zM15 7h4v7h-4zM10 4h4v3h-4z" />
        </svg>
      );
  }
}
