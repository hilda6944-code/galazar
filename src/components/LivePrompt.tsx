import { Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';

interface LivePromptProps {
  prompt: string;
}

export function LivePrompt({ prompt }: LivePromptProps) {
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

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary/70" />
          <h3 className="text-sm font-semibold">Live Prompt</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!prompt.trim()}
          className="text-xs h-8"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Prompt
            </>
          )}
        </Button>
      </div>

      {copyError && <p className="text-xs text-destructive">Copy failed. Select and copy the prompt manually.</p>}

      <div
        className={`rounded-lg px-4 py-3 text-sm leading-relaxed min-h-[80px] whitespace-pre-wrap ${
          prompt.trim()
            ? 'bg-muted/50 text-foreground'
            : 'bg-muted/30 text-muted-foreground italic'
        }`}
      >
        {prompt.trim() || 'Your assembled prompt will appear here as you build...'}
      </div>

      {prompt.trim() && (
        <p className="text-[10px] text-muted-foreground/60">
          {prompt.trim().split(/\s+/).length} words · {prompt.length} characters
        </p>
      )}
    </div>
  );
}
