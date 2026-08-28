import { useEffect, useRef, useState } from 'react';
import { ArrowDown, CheckCircle2, GitBranch, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { VISUAL_PIPELINE_DECISION_RULES, VISUAL_PIPELINE_STAGES } from '@/lib/visualPipeline';
import { LmStudioRequestCancelledError, MAX_VISUAL_PIPELINE_IMAGE_BYTES, SUPPORTED_IMAGE_MIME_TYPES, isLmStudioCancellation } from '@/lib/lmStudioClient';
import { runVisualPipeline, type VisualPipelineResult } from '@/lib/visualPipelineRunner';
import { Button } from '@/components/ui/button';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the selected image.'));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function ResultPanel({ title, value }: { title: string; value: string }) {
  return <div className="rounded-lg border border-border/50 bg-card/50 p-4"><h3 className="mb-2 text-sm font-medium">{title}</h3><p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{value}</p></div>;
}

export function VisualPipelinePage() {
  const pipeline = ['Image', ...VISUAL_PIPELINE_STAGES.map((stage) => stage.label)];
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VisualPipelineResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    controllerRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectImage = (file: File | undefined) => {
    setError(null);
    setResult(null);
    if (!file) return;
    if (!SUPPORTED_IMAGE_MIME_TYPES.includes(file.type as typeof SUPPORTED_IMAGE_MIME_TYPES[number])) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_VISUAL_PIPELINE_IMAGE_BYTES) {
      setError(`Choose an image no larger than ${MAX_VISUAL_PIPELINE_IMAGE_BYTES / 1024 / 1024} MB.`);
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const run = async () => {
    if (!imageFile || running) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunning(true);
    setResult(null);
    setError(null);
    setStatus('Preparing image locally…');
    try {
      const imageDataUrl = await fileToDataUrl(imageFile);
      if (controller.signal.aborted) throw new LmStudioRequestCancelledError();
      setStatus('Running Visual Evaluator and Decision…');
      const nextResult = await runVisualPipeline(imageDataUrl, { signal: controller.signal });
      setResult(nextResult);
      setStatus(nextResult.decision === 'PASS' ? 'PASS — pipeline stopped.' : 'Visual Pipeline complete.');
    } catch (runError) {
      if (isLmStudioCancellation(runError)) setStatus('Run cancelled.');
      else {
        setStatus(null);
        setError(runError instanceof Error ? runError.message : 'Visual Pipeline failed.');
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Visual Pipeline</h2>
        <p className="text-sm text-muted-foreground mt-1">A separate evaluation and edit-planning workflow</p>
      </div>

      <div className="space-y-4 max-w-3xl overflow-y-auto">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium"><ImagePlus className="h-4 w-4 text-primary/60" />Image</h3>
          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex min-h-36 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground hover:bg-muted/30">
              {previewUrl ? <img src={previewUrl} alt="Selected for visual evaluation" className="max-h-64 w-full object-contain" /> : <span className="px-4">Choose a JPEG, PNG, or WebP image<br />Maximum 10 MB</span>}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={running} onChange={(event) => selectImage(event.target.files?.[0])} />
            </label>
            <div className="flex shrink-0 flex-col justify-end gap-2 sm:w-40">
              <Button onClick={run} disabled={!imageFile || running}>{running ? <><LoaderCircle className="animate-spin" />Running…</> : 'Run Galazar'}</Button>
              {running && <Button variant="outline" onClick={() => controllerRef.current?.abort()}><X />Cancel</Button>}
            </div>
          </div>
          {status && <p className="mt-3 text-xs text-primary">{status}</p>}
          {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResultPanel title="Visual Evaluation" value={result?.visualEvaluation ?? 'Not run'} />
          <ResultPanel title="Decision" value={result?.decision ?? 'Not run'} />
          <ResultPanel title="Candidate Improvement" value={result ? result.candidateImprovement ?? 'NOT REQUIRED' : 'Not run'} />
          <ResultPanel title="Final Edit Prompt" value={result ? result.finalEditPrompt ?? 'NOT REQUIRED' : 'Not run'} />
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-5">
          <div className="flex flex-col items-center">
            {pipeline.map((label, index) => (
              <div key={label} className="flex flex-col items-center">
                <div className="min-w-64 rounded-md border border-border/50 bg-muted/30 px-4 py-2.5 text-center text-sm font-medium">
                  {label}
                </div>
                {index < pipeline.length - 1 && <ArrowDown className="my-2 h-4 w-4 text-primary/50" />}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <GitBranch className="h-4 w-4 text-primary/60" />
            Decision rule
          </h3>
          <div className="space-y-2">
            {VISUAL_PIPELINE_DECISION_RULES.map((rule) => (
              <div key={rule} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {VISUAL_PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <h3 className="mb-2 text-sm font-medium">{stage.label}</h3>
              <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                {stage.instructions.map((instruction) => <li key={instruction}>• {instruction}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
