import { AlertTriangle } from 'lucide-react';
import Button from '../Button.jsx';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-error">
      <AlertTriangle size={22} />
      <div>
        <strong>{message || 'Something went wrong'}</strong>
        {onRetry ? <Button variant="ghost" size="sm" onClick={onRetry}>Retry</Button> : null}
      </div>
    </div>
  );
}
