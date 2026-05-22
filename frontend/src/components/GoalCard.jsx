import { CheckCircle2, Trash2 } from 'lucide-react';
import BadgePill from './BadgePill.jsx';
import Button from './Button.jsx';
import ProgressBar from './ProgressBar.jsx';
import { formatDate, goalProgress, labelize } from '../utils/formatters.js';

export default function GoalCard({ goal, onComplete, onDelete }) {
  const progress = goalProgress(goal);

  return (
    <article className="goal-card">
      <div>
        <div className="workout-title-row">
          <h3>{goal.title}</h3>
          <BadgePill tone={goal.status === 'COMPLETED' ? 'mint' : 'neutral'}>{labelize(goal.type)}</BadgePill>
        </div>
        <p>
          {goal.currentValue || 0}
          {goal.unit ? ` ${goal.unit}` : ''} / {goal.targetValue || 0}
          {goal.unit ? ` ${goal.unit}` : ''}
        </p>
      </div>
      <ProgressBar value={progress} label={goal.deadline ? `Due ${formatDate(goal.deadline)}` : 'Progress'} />
      <div className="card-actions">
        {goal.status !== 'COMPLETED' ? (
          <Button variant="ghost" size="sm" icon={CheckCircle2} onClick={() => onComplete(goal)}>
            Complete
          </Button>
        ) : null}
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(goal.id)}>
          Delete
        </Button>
      </div>
    </article>
  );
}
