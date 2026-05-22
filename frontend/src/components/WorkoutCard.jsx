import { Copy, Dumbbell, Trash2 } from 'lucide-react';
import Button from './Button.jsx';
import BadgePill from './BadgePill.jsx';
import { formatDate, formatNumber, labelize } from '../utils/formatters.js';

export default function WorkoutCard({ session, onDuplicate, onDelete }) {
  const note = session.notes?.[0]?.body;

  return (
    <article className="workout-card">
      <div className="workout-card-main">
        <div className="workout-icon">
          <Dumbbell size={20} />
        </div>
        <div>
          <div className="workout-title-row">
            <h3>{session.title}</h3>
            <BadgePill tone={session.status === 'COMPLETED' ? 'mint' : 'amber'}>{labelize(session.status)}</BadgePill>
          </div>
          <p>{formatDate(session.completedAt || session.scheduledFor)}</p>
          <div className="mini-metrics">
            <span>{session.durationMinutes || 0} min</span>
            <span>{formatNumber(session.totalVolume)} volume</span>
            <span>{formatNumber(session.totalDistance, 1)} mi</span>
          </div>
          {note ? <small className="muted-note">{note}</small> : null}
        </div>
      </div>
      {(onDuplicate || onDelete) && (
        <div className="card-actions">
          {onDuplicate ? (
            <Button variant="ghost" size="sm" icon={Copy} onClick={() => onDuplicate(session.id)}>
              Duplicate
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(session.id)}>
              Delete
            </Button>
          ) : null}
        </div>
      )}
    </article>
  );
}
