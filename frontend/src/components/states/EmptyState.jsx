import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title, detail }) {
  return (
    <div className="empty-state">
      <ClipboardList size={28} />
      <strong>{title}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
