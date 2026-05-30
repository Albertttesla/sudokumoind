"use client";

interface ProModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  "Unlimited AI Coach sessions",
  "Advanced puzzle analytics",
  "Exclusive themes & cell styles",
  "Ad-free experience",
  "Cloud sync across devices",
];

export function ProModal({ open, onClose }: ProModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pro-title">
      <button type="button" className="modal-backdrop__hit" onClick={onClose} aria-label="Close" />
      <div className="modal-card modal-card--pro">
        <div className="modal-card__gradient-bar" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="pro-badge">PRO</span>
        <h2 id="pro-title" className="modal-card__title">
          Upgrade to SudokuMind Pro
        </h2>
        <p className="modal-card__subtitle">
          Unlock the full premium experience — demo pricing only, no payment required.
        </p>
        <ul className="pro-features">
          {FEATURES.map((f) => (
            <li key={f}>
              <span className="pro-features__check">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="pro-pricing">
          <span className="pro-pricing__price">$2.99</span>
          <span className="pro-pricing__period">/ month</span>
        </div>
        <button type="button" className="btn-gradient btn-gradient--full" onClick={onClose}>
          Start Pro Trial
        </button>
        <p className="pro-disclaimer">UI preview only — billing not connected.</p>
      </div>
    </div>
  );
}
