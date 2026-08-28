import { useMemo, useState } from 'react';
import { ArrowLeft, Edit3, FolderOpen, Plus, Search, Trash2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { filterProjects } from '@/lib/projects';
import { type Build, type Project } from '@/types/galazar';

interface ProjectsPageProps {
  projects: Project[];
  savedBuilds: Build[];
  hasUnsavedActiveBuild: boolean;
  onCreateProject: (name: string) => void;
  onRenameProject: (projectId: string, name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAssignBuild: (buildId: string, projectId: string) => void;
  onRemoveBuild: (projectId: string, buildId: string) => void;
  onOpenBuild: (build: Build) => void;
}

export function ProjectsPage({ projects, savedBuilds, hasUnsavedActiveBuild, onCreateProject, onRenameProject, onDeleteProject, onAssignBuild, onRemoveBuild, onOpenBuild }: ProjectsPageProps) {
  const [query, setQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [loadTarget, setLoadTarget] = useState<Build | null>(null);

  const filteredProjects = useMemo(() => filterProjects(projects, query), [projects, query]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const projectBuilds = selectedProject
    ? selectedProject.buildIds.map((id) => savedBuilds.find((build) => build.id === id)).filter((build): build is Build => build !== undefined)
    : [];

  const submitCreate = () => {
    if (!createName.trim()) return;
    onCreateProject(createName);
    setCreateName('');
    setCreateOpen(false);
  };

  const submitRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    onRenameProject(renameTarget.id, renameValue);
    setRenameTarget(null);
  };

  const requestOpenBuild = (build: Build) => {
    if (hasUnsavedActiveBuild) setLoadTarget(build);
    else onOpenBuild(build);
  };

  if (selectedProject) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" size="sm" className="h-7 px-1 mb-2 text-xs" onClick={() => setSelectedProjectId(null)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
            </Button>
            <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Associated saved builds</p>
          </div>
          <select value="" onChange={(event) => event.target.value && onAssignBuild(event.target.value, selectedProject.id)} className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground" aria-label="Assign a saved build">
            <option value="">Assign saved build...</option>
            {savedBuilds.filter((build) => !selectedProject.buildIds.includes(build.id)).map((build) => <option key={build.id} value={build.id}>{build.name}</option>)}
          </select>
        </div>

        {projectBuilds.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FolderOpen className="w-12 h-12 mb-4 opacity-40" /><p className="text-sm">No saved builds assigned</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto">
            {projectBuilds.map((build) => (
              <div key={build.id} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><h3 className="font-medium text-sm">{build.name}</h3><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{build.prompt || 'Empty prompt'}</p></div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => requestOpenBuild(build)}><FolderOpen className="w-3.5 h-3.5 mr-1" /> Open</Button>
                    <select value={selectedProject.id} onChange={(event) => onAssignBuild(build.id, event.target.value)} className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground" aria-label={`Move ${build.name} to project`}>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label={`Remove ${build.name} from project`} onClick={() => onRemoveBuild(selectedProject.id, build.id)}><Unlink className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Dialog open={loadTarget !== null} onOpenChange={(open) => !open && setLoadTarget(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Replace Unsaved Build?</DialogTitle><DialogDescription>Opening “{loadTarget?.name}” will replace the current unsaved active build. Saved records and project memberships will not change.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" size="sm" onClick={() => setLoadTarget(null)}>Cancel</Button><Button size="sm" onClick={() => { if (loadTarget) onOpenBuild(loadTarget); setLoadTarget(null); }}>Open Saved Build</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-semibold">Projects</h2><p className="text-sm text-muted-foreground mt-1">Organize your saved builds into projects</p></div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> New Project</Button>
      </div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="pl-9" /></div>

      {filteredProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><FolderOpen className="w-12 h-12 mb-4 opacity-40" /><p className="text-sm">{projects.length === 0 ? 'No projects yet' : 'No matching projects'}</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors">
              <div className="flex items-start justify-between gap-3">
                <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedProjectId(project.id)}><h3 className="font-medium text-sm">{project.name}</h3><p className="text-[10px] text-muted-foreground/60 mt-2">{project.buildIds.length} builds</p></button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`Rename ${project.name}`} onClick={() => { setRenameTarget(project); setRenameValue(project.name); }}><Edit3 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete ${project.name}`} onClick={() => setDeleteTarget(project)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>Create Project</DialogTitle><DialogDescription>Name the collection for your saved builds.</DialogDescription></DialogHeader><Input value={createName} onChange={(event) => setCreateName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitCreate()} autoFocus /><DialogFooter><Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button><Button size="sm" disabled={!createName.trim()} onClick={submitCreate}>Create</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}><DialogContent><DialogHeader><DialogTitle>Rename Project</DialogTitle><DialogDescription>Memberships will remain unchanged.</DialogDescription></DialogHeader><Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitRename()} autoFocus /><DialogFooter><Button variant="outline" size="sm" onClick={() => setRenameTarget(null)}>Cancel</Button><Button size="sm" disabled={!renameValue.trim()} onClick={submitRename}>Rename</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Delete Project?</DialogTitle><DialogDescription>Saved builds in “{deleteTarget?.name}” will be preserved and become unassigned.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" size="sm" onClick={() => { if (deleteTarget) onDeleteProject(deleteTarget.id); setDeleteTarget(null); }}>Delete Project</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
