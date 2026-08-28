import { Lock, Unlock } from 'lucide-react';

interface LockToggleProps {
  label: string;
  locked: boolean;
  onToggle: () => void;
}

export function LockToggle({ label, locked, onToggle }: LockToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors ${
        locked
          ? 'border-amber-400/40 bg-amber-400/10 text-amber-400'
          : 'border-muted-foreground/20 bg-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      {label}
    </button>
  );
}
