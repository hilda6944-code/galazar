import { useState } from 'react';
import { Edit3, GitBranch, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Variant } from '@/types/galazar';
import { requiresVariantLoadConfirmation } from '@/lib/variants';

interface VariantsPageProps {
  variants: Variant[];
  activeVariantId: string | null;
  hasUnsavedActiveBuild: boolean;
  onOpenVariant: (variant: Variant) => void;
  onRenameVariant: (variantId: string, name: string) => void;
  onDeleteVariant: (variantId: string) => void;
}

export function VariantsPage({ variants, activeVariantId, hasUnsavedActiveBuild, onOpenVariant, onRenameVariant, onDeleteVariant }: VariantsPageProps) {
  const [loadTarget, setLoadTarget] = useState<Variant | null>(null);
  const [renameTarget, setRenameTarget] = useState<Variant | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Variant | null>(null);

  const requestOpen = (variant: Variant) => requiresVariantLoadConfirmation(hasUnsavedActiveBuild) ? setLoadTarget(variant) : onOpenVariant(variant);
  const submitRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    onRenameVariant(renameTarget.id, renameValue);
    setRenameTarget(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6"><h2 className="text-xl font-semibold">Variants</h2><p className="text-sm text-muted-foreground mt-1">Independent branches created from active builds</p></div>
      {variants.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><GitBranch className="w-12 h-12 mb-4 opacity-40" /><p className="text-sm">No variants yet</p><p className="text-xs mt-1 opacity-60">Create a branch from Prompt Builder</p></div>
      ) : (
        <div className="space-y-2 overflow-y-auto">
          {variants.map((variant) => (
            <div key={variant.id} className="rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><h3 className="font-medium text-sm">{variant.name}</h3><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{variant.prompt || 'Empty prompt'}</p><p className="text-[10px] text-muted-foreground/60 mt-2">Origin: {variant.originBuild.name}</p></div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => requestOpen(variant)}><GitBranch className="w-3.5 h-3.5 mr-1" /> Open</Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`Rename ${variant.name}`} onClick={() => { setRenameTarget(variant); setRenameValue(variant.name); }}><Edit3 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete ${variant.name}`} onClick={() => setDeleteTarget(variant)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={loadTarget !== null} onOpenChange={(open) => !open && setLoadTarget(null)}><DialogContent><DialogHeader><DialogTitle>Replace Unsaved Build?</DialogTitle><DialogDescription>Opening “{loadTarget?.name}” will replace the current unsaved active build. The branch origin and other records will not change.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" size="sm" onClick={() => setLoadTarget(null)}>Cancel</Button><Button size="sm" onClick={() => { if (loadTarget) onOpenVariant(loadTarget); setLoadTarget(null); }}>Open Variant</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}><DialogContent><DialogHeader><DialogTitle>Rename Variant</DialogTitle><DialogDescription>The branch origin will remain unchanged.</DialogDescription></DialogHeader><Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitRename()} autoFocus /><DialogFooter><Button variant="outline" size="sm" onClick={() => setRenameTarget(null)}>Cancel</Button><Button size="sm" disabled={!renameValue.trim()} onClick={submitRename}>Rename</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Delete Variant?</DialogTitle><DialogDescription>{deleteTarget?.id === activeVariantId ? `This deletes “${deleteTarget?.name}” as a Variant. The build currently shown in Prompt Builder will remain available as an independent build.` : `This deletes “${deleteTarget?.name}” only. The active build, its source, and other variants will remain unchanged.`}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" size="sm" onClick={() => { if (deleteTarget) onDeleteVariant(deleteTarget.id); setDeleteTarget(null); }}>Delete Variant</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
