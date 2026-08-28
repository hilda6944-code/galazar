import { useState, type ChangeEvent } from 'react';
import { AlertTriangle, Download, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { parseBackup, type RestorePreview } from '@/lib/backups';
import type { AppState } from '@/types/galazar';

interface SettingsPageProps {
  onClearAllData: () => void;
  onExportBackup: () => void;
  onRestoreBackup: (state: AppState) => boolean;
}

export function SettingsPage({ onClearAllData, onExportBackup, onRestoreBackup }: SettingsPageProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restorePreview, setRestorePreview] = useState<RestorePreview | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const selectBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setRestoreStatus(null);
    try {
      const preview = parseBackup(await file.text());
      setRestorePreview(preview);
      setRestoreError(null);
    } catch (error) {
      setRestorePreview(null);
      setRestoreError(error instanceof Error ? error.message : 'The backup could not be read.');
    }
  };

  const confirmRestore = () => {
    if (!restorePreview) return;
    onExportBackup();
    if (onRestoreBackup(restorePreview.state)) {
      setRestoreStatus('Backup restored successfully. A pre-restore backup was downloaded.');
      setRestorePreview(null);
      setRestoreError(null);
    } else {
      setRestoreStatus('Restore was not applied because browser storage could not be updated. Your current workspace remains unchanged.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6"><h2 className="text-xl font-semibold">Settings</h2><p className="text-sm text-muted-foreground mt-1">GALAZAR workspace data and recovery</p></div>

      <div className="space-y-6 max-w-2xl overflow-y-auto">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
          <div><h3 className="font-medium text-sm mb-1">Backup &amp; Restore</h3><p className="text-xs text-muted-foreground">Export the complete browser-local workspace or restore a validated GALAZAR backup.</p></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onExportBackup}><Download className="w-3.5 h-3.5 mr-1.5" />Export All Backup</Button>
            <Button variant="outline" size="sm" asChild><label className="cursor-pointer"><RotateCcw className="w-3.5 h-3.5 mr-1.5" />Choose Backup to Restore<input className="sr-only" type="file" accept="application/json,.json" onChange={selectBackup} /></label></Button>
          </div>
          {restoreError && <p className="text-xs text-destructive">{restoreError}</p>}
          {restoreStatus && <p className="text-xs text-muted-foreground">{restoreStatus}</p>}
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <h3 className="font-medium text-sm mb-1">Data Management</h3>
          <p className="text-xs text-muted-foreground mb-4">GALAZAR stores workspace data locally in this browser profile. Export a backup before clearing it.</p>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-3.5 h-3.5 mr-1.5" />Clear All Data</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Clear All Data?</DialogTitle><DialogDescription>This permanently removes the active workspace, Saved Builds, Projects, Variants, DNA Library, Engine Library, and other persisted GALAZAR state. Export a backup first.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button variant="destructive" size="sm" onClick={() => { onClearAllData(); setConfirmOpen(false); }}>Yes, Clear Everything</Button></DialogFooter></DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4"><h3 className="font-medium text-sm mb-1">About GALAZAR</h3><p className="text-xs text-muted-foreground">GALAZAR 1.0</p><p className="text-[10px] text-muted-foreground/60 mt-2">Local-first creative prompt builder. All data is stored locally.</p></div>
      </div>

      <Dialog open={restorePreview !== null} onOpenChange={(open) => !open && setRestorePreview(null)}>
        <DialogContent><DialogHeader><DialogTitle>Restore GALAZAR Backup?</DialogTitle><DialogDescription>This replaces the complete current workspace only after browser storage accepts the restored state. GALAZAR will download a pre-restore backup first.</DialogDescription></DialogHeader>{restorePreview && <div className="rounded-md bg-muted/30 p-3 text-xs space-y-1"><p>Saved Builds: {restorePreview.summary.savedBuilds}</p><p>Projects: {restorePreview.summary.projects}</p><p>Variants: {restorePreview.summary.variants}</p><p>DNA entries: {restorePreview.summary.dnaEntries}</p><p>Engines: {restorePreview.summary.engines}</p>{restorePreview.warnings.length > 0 && <div className="pt-2 text-amber-400">{restorePreview.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}</div>}<DialogFooter><Button variant="outline" onClick={() => setRestorePreview(null)}>Cancel</Button><Button onClick={confirmRestore}>Restore All</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
