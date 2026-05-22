import { createElement } from 'react';

export default function StatCard({ icon, label, value, detail, tone = 'mint' }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon ? createElement(icon, { size: 20 }) : null}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}
