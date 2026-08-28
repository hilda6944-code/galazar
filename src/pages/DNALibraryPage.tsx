import { useMemo, useState } from 'react';
import { Dna, Edit3, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { filterDNAEntries } from '@/lib/dnaLibrary';
import { type DNALibraryEntry } from '@/types/galazar';

interface DNALibraryPageProps {
  entries: DNALibraryEntry[];
  onApplyEntry: (entry: DNALibraryEntry) => void;
  onRenameEntry: (entryId: string, name: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function DNALibraryPage({ entries, onApplyEntry, onRenameEntry, onDeleteEntry }: DNALibraryPageProps) {
  const [query, setQuery] = useState('');
  const [renameTarget, setRenameTarget] = useState<DNALibraryEntry | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DNALibraryEntry | null>(null);
  const filteredEntries = useMemo(() => filterDNAEntries(entries, query), [entries, query]);

  const submitRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    onRenameEntry(renameTarget.id, renameValue);
    setRenameTarget(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6"><h2 className="text-xl font-semibold">DNA Library</h2><p className="text-sm text-muted-foreground mt-1">Reusable module and DNA configurations</p></div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search DNA entries..." className="pl-9" /></div>

      {filteredEntries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><Dna className="w-12 h-12 mb-4 opacity-40" /><p className="text-sm">{entries.length === 0 ? 'DNA Library is empty' : 'No matching DNA entries'}</p><p className="text-xs mt-1 opacity-60">Save a module configuration from Prompt Builder</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><div className="flex items-center gap-2"><Dna className="w-3.5 h-3.5 text-primary/60" /><h3 className="font-medium text-sm">{entry.name}</h3></div><span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-1 block">{entry.category}</span><p className="text-xs text-muted-foreground mt-2 line-clamp-3">{entry.content}</p></div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={!entry.moduleState} onClick={() => onApplyEntry(entry)}>Apply</Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`Rename ${entry.name}`} onClick={() => { setRenameTarget(entry); setRenameValue(entry.name); }}><Edit3 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete ${entry.name}`} onClick={() => setDeleteTarget(entry)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}><DialogContent><DialogHeader><DialogTitle>Rename DNA Entry</DialogTitle><DialogDescription>The saved configuration will remain unchanged.</DialogDescription></DialogHeader><Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitRename()} autoFocus /><DialogFooter><Button variant="outline" size="sm" onClick={() => setRenameTarget(null)}>Cancel</Button><Button size="sm" disabled={!renameValue.trim()} onClick={submitRename}>Rename</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Delete DNA Entry?</DialogTitle><DialogDescription>This deletes “{deleteTarget?.name}” only. Active builds and other Library entries remain unchanged.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" size="sm" onClick={() => { if (deleteTarget) onDeleteEntry(deleteTarget.id); setDeleteTarget(null); }}>Delete Entry</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
