import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, RefreshCw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  assembleRegeneratedPrompt,
  regeneratePromptParts,
  type PromptParts,
  type PromptRegenerationTarget,
} from '@/lib/promptRegenerator';
import { isLmStudioCancellation } from '@/lib/lmStudioClient';

interface PromptRegeneratorProps {
  sourcePrompt: string;
}

const REGENERATION_ACTIONS: Array<{ target: PromptRegenerationTarget; label: string }> = [
  { target: 'subject', label: 'Regenerate Subject' },
  { target: 'actionPose', label: 'Regenerate Action/Pose' },
  { target: 'environment', label: 'Regenerate Environment' },
  { target: 'lightingMood', label: 'Regenerate Lighting/Mood' },
  { target: 'styleMedium', label: 'Regenerate Style/Medium' },
  { target: 'all', label: 'Regenerate All' },
];

const PART_LABELS: Array<{ key: keyof PromptParts; label: string }> = [
  { key: 'subject', label: 'Subject' },
  { key: 'actionPose', label: 'Action/Pose' },
  { key: 'environment', label: 'Environment' },
  { key: 'lightingMood', label: 'Lighting/Mood' },
  { key: 'styleMedium', label: 'Style/Medium' },
];

export function PromptRegenerator({ sourcePrompt }: PromptRegeneratorProps) {
  const [parts, setParts] = useState<PromptParts | null>(null);
  const [activeTarget, setActiveTarget] = useState<PromptRegenerationTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setParts(null);
    setActiveTarget(null);
    setError(null);
    setCopied(false);
  }, [sourcePrompt]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleRegenerate = useCallback(async (target: PromptRegenerationTarget) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setActiveTarget(target);
    setError(null);
    setCopied(false);

    try {
      const nextParts = await regeneratePromptParts(sourcePrompt, parts, target, { signal: controller.signal });
      if (controllerRef.current !== controller) return;
      setParts(nextParts);
    } catch (requestError) {
      if (controllerRef.current !== controller || isLmStudioCancellation(requestError)) return;
      setError(requestError instanceof Error ? requestError.message : 'Prompt regeneration failed.');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setActiveTarget(null);
      }
    }
  }, [parts, sourcePrompt]);

  const handleCancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const handleCopy = useCallback(async () => {
    if (!parts) return;
    try {
      await navigator.clipboard.writeText(assembleRegeneratedPrompt(parts));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.warn('Copy failed', copyError);
      setError('Copy failed. Select and copy the regenerated prompt manually.');
    }
  }, [parts]);

  const isRunning = activeTarget !== null;
  const hasSource = Boolean(sourcePrompt.trim());

  return (
    <section className="rounded-xl border border-primary/25 bg-card p-4 space-y-4" aria-labelledby="prompt-regenerator-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 id="prompt-regenerator-title" className="text-sm font-semibold">Prompt Regenerator</h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Regenerate one part or all five with your local LM Studio AI. Untouched parts stay exactly the same.
          </p>
        </div>
        {isRunning && (
          <Button variant="outline" size="sm" onClick={handleCancel} className="h-9 text-xs">
            <X className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {REGENERATION_ACTIONS.map((action) => (
          <Button
            key={action.target}
            variant={action.target === 'all' ? 'default' : 'outline'}
            size="sm"
            disabled={!hasSource || isRunning}
            onClick={() => handleRegenerate(action.target)}
            className="h-10 justify-start text-xs"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${activeTarget === action.target ? 'animate-spin' : ''}`} />
            {activeTarget === action.target ? 'Regenerating…' : action.label}
          </Button>
        ))}
      </div>

      {!hasSource && (
        <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
          Build a Live Prompt first, then choose what you want to regenerate.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {parts && (
        <div className="space-y-3" aria-live="polite">
          <div className="grid gap-2 md:grid-cols-2">
            {PART_LABELS.map((part) => (
              <div key={part.key} className="rounded-lg border border-border/50 bg-muted/25 px-3 py-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary/80">{part.label}</p>
                <p className="text-sm leading-relaxed text-foreground">{parts[part.key]}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold">Five-Part Prompt</p>
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{assembleRegeneratedPrompt(parts)}</p>
          </div>
        </div>
      )}
    </section>
  );
}
