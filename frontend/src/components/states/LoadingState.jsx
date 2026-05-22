import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading', fullScreen = false }) {
  return (
    <div className={fullScreen ? 'state-screen' : 'state-box'}>
      <Loader2 className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}
