export default function ProgressBar({ value = 0, label }) {
  const safeValue = Math.max(0, Math.min(Number(value || 0), 100));

  return (
    <div className="progress-block">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{safeValue}%</strong>
      </div>
      <div className="progress-track" aria-label={label}>
        <span style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
