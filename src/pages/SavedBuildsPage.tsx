import { useState } from 'react';
import { Bookmark, Edit3, FolderOpen, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Build } from '@/types/galazar';
import { requiresSavedBuildLoadConfirmation, searchSavedBuilds } from '@/lib/savedBuilds';

interface SavedBuildsPageProps {
  builds: Build[];
  hasUnsavedActiveBuild: boolean;
  onLoadBuild: (build: Build) => void;
  onDeleteBuild: (buildId: string) => void;
  onRenameBuild: (buildId: string, name: string) => void;
}

export function SavedBuildsPage({
  builds,
  hasUnsavedActiveBuild,
  onLoadBuild,
  onDeleteBuild,
  onRenameBuild,
}: SavedBuildsPageProps) {
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null);
  const [renameTarget, setRenameTarget] = useState<Build | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [loadTarget, setLoadTarget] = useState<Build | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const visibleBuilds = searchSavedBuilds(builds, searchQuery);

  const openRename = (build: Build) => {
    setRenameTarget(build);
    setRenameValue(build.name);
  };

  const confirmRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    onRenameBuild(renameTarget.id, renameValue);
    setRenameTarget(null);
  };

  const requestLoad = (build: Build) => {
    if (requiresSavedBuildLoadConfirmation(hasUnsavedActiveBuild)) {
      setLoadTarget(build);
    } else {
      onLoadBuild(build);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Saved Builds</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your archived prompt builds
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search saved builds..." className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
      </div>

      {builds.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Bookmark className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-sm">No saved builds yet</p>
          <p className="text-xs mt-1 opacity-60">Save a build from the Prompt Builder to see it here</p>
        </div>
      ) : visibleBuilds.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Search className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-sm">No saved builds match your search</p>
          <p className="text-xs mt-1 opacity-60">Try a different name or prompt phrase</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleBuilds.map((build) => (
            <div
              key={build.id}
              className="rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium text-sm">{build.name}</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => requestLoad(build)}>
                    <FolderOpen className="w-3.5 h-3.5 mr-1" />
                    Open
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`Rename ${build.name}`} onClick={() => openRename(build)}>
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete ${build.name}`} onClick={() => setDeleteTarget(build)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{build.prompt || 'Empty prompt'}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                Saved {new Date(build.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Saved Build</DialogTitle>
            <DialogDescription>Change the name of this saved record.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && confirmRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button size="sm" disabled={!renameValue.trim()} onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadTarget !== null} onOpenChange={(open) => !open && setLoadTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Unsaved Build?</DialogTitle>
            <DialogDescription>
              Opening “{loadTarget?.name}” will replace the current unsaved active build. Saved records will not be changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLoadTarget(null)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => {
                if (loadTarget) onLoadBuild(loadTarget);
                setLoadTarget(null);
              }}
            >
              Open Saved Build
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Saved Build?</DialogTitle>
            <DialogDescription>
              This will permanently delete “{deleteTarget?.name}”. The active build and other saved builds will not be changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deleteTarget) onDeleteBuild(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
