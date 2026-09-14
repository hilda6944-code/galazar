import { type ViewId } from '@/types/galazar';
import {
  PenTool,
  FolderOpen,
  Bookmark,
  Dna,
  Settings,
  Layers,
  GitBranch,
  ScanSearch,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
}

const views: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: 'prompt-builder', label: 'Prompt Builder', icon: <PenTool className="w-4 h-4" /> },
  { id: 'visual-pipeline', label: 'Visual Pipeline', icon: <ScanSearch className="w-4 h-4" /> },
  { id: 'image-generator', label: 'Generate Image', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'saved-builds', label: 'Saved Builds', icon: <Bookmark className="w-4 h-4" /> },
  { id: 'variants', label: 'Variants', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'dna-library', label: 'DNA Library', icon: <Dna className="w-4 h-4" /> },
  { id: 'engine-library', label: 'Engine Library', icon: <Settings className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { id: 'architecture', label: 'Architecture', icon: <Layers className="w-4 h-4" /> },
];

export function Sidebar({ activeView, onChangeView }: SidebarProps) {
  return (
    <aside className="w-56 border-r border-border/50 bg-card/30 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border/40">
        <h1 className="text-lg font-bold tracking-wider">GALAZAR</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          Prompt Workspace
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {views.map((view) => {
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onChangeView(view.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40 text-[10px] text-muted-foreground/60">
        GALAZAR 1.0
      </div>
    </aside>
  );
}
