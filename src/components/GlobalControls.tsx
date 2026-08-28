import { Undo2, Redo2, Save, Copy, Check, Trash2, GitBranch, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';

interface GlobalControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onClear: () => void;
  onCreateVariant: () => void;
  onCreateEngine: () => void;
  prompt: string;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
}

export function GlobalControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onClear,
  onCreateVariant,
  onCreateEngine,
  prompt,
  hasUnsavedChanges,
  lastSavedAt,
}: GlobalControlsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!prompt.trim()) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
      setCopyError(true);
    }
  }, [prompt]);

  const formatTime = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateVariant}
          className="text-xs h-8"
        >
          <GitBranch className="w-3.5 h-3.5 mr-1.5" />
          Create Variant
        </Button>
        <Button variant="outline" size="sm" onClick={onCreateEngine} className="text-xs h-8">
          <Cog className="w-3.5 h-3.5 mr-1.5" />
          Create Engine
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="text-xs h-8"
        >
          <Undo2 className="w-3.5 h-3.5 mr-1.5" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="text-xs h-8"
        >
          <Redo2 className="w-3.5 h-3.5 mr-1.5" />
          Redo
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {/* Save status */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {lastSavedAt && <Check className="w-3 h-3 text-emerald-400" />}
          <span className={lastSavedAt ? 'text-emerald-400/80' : 'text-muted-foreground'}>{lastSavedAt ? `Workspace autosaved at ${formatTime(lastSavedAt)}` : 'Workspace not yet autosaved'}</span>
          {hasUnsavedChanges && <span className="text-amber-400/80">· Not preserved as Saved Build</span>}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="text-xs h-8"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Build
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs h-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Clear Build
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleCopy}
          disabled={!prompt.trim()}
          className="text-xs h-8"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Prompt
            </>
          )}
        </Button>
        {copyError && <span className="text-[10px] text-destructive">Copy failed</span>}
      </div>
    </div>
  );
}
