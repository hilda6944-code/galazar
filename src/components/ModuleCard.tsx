import { ChevronDown, ChevronRight, Lock, Unlock, EyeOff, Circle, CheckCircle2, Plus, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ModuleState, type ModuleStatus, type IntentDNA, type WorldDNA, type AtmosphereDNA, type AnchorDNA, type SubjectDNA, type Element, type ColorDNA, type LightDNA, type CameraDNA, type FormatDNA, type StyleDNA, type MediumDNA, type FinishDNA, type ExclusionDNA, MODULE_LABELS, createEmptyIntentDNA, createEmptyWorldDNA, createEmptyAtmosphereDNA, createEmptyAnchorDNA, createEmptyCameraDNA, createEmptyFormatDNA, createEmptyFinishDNA, createEmptyExclusionDNA } from '@/types/galazar';
import { IntentDNAPanel } from './intent/IntentDNAPanel';
import { WorldDNAPanel } from './world/WorldDNAPanel';
import { AtmosphereDNAPanel } from './atmosphere/AtmosphereDNAPanel';
import { AnchorDNAPanel } from './anchor/AnchorDNAPanel';
import { SubjectDNAPanel } from './subject/SubjectDNAPanel';
import { ElementCard } from './elements/ElementCard';
import { ColorDNAPanel } from './color/ColorDNAPanel';
import { LightDNAPanel } from './light/LightDNAPanel';
import { CameraDNAPanel } from './camera/CameraDNAPanel';
import { FormatDNAPanel } from './format/FormatDNAPanel';
import { StyleDNAPanel } from './style/StyleDNAPanel';
import { MediumDNAPanel } from './medium/MediumDNAPanel';
import { FinishDNAPanel } from './finish/FinishDNAPanel';
import { ExclusionDNAPanel } from './exclusions/ExclusionDNAPanel';

interface ModuleCardProps {
  moduleState: ModuleState;
  variantEditingLocked: boolean;
  onToggleExpand: () => void;
  onToggleSkip: () => void;
  onToggleLock: () => void;
  onSaveToLibrary: () => void;
  onCustomTextChange: (text: string) => void;
  onIntentDNAChange?: (dna: IntentDNA) => void;
  onWorldDNAChange?: (dna: WorldDNA) => void;
  onAtmosphereDNAChange?: (dna: AtmosphereDNA) => void;
  onAnchorDNAChange?: (dna: AnchorDNA) => void;
  onSubjectDNAChange?: (dna: SubjectDNA) => void;
  onColorDNAChange?: (dna: ColorDNA) => void;
  onLightDNAChange?: (dna: LightDNA) => void;
  onCameraDNAChange?: (dna: CameraDNA) => void;
  onFormatDNAChange?: (dna: FormatDNA) => void;
  onStyleDNAChange?: (dna: StyleDNA) => void;
  onMediumDNAChange?: (dna: MediumDNA) => void;
  onFinishDNAChange?: (dna: FinishDNA) => void;
  onExclusionDNAChange?: (dna: ExclusionDNA) => void;
  isExpanded: boolean;
  // Phase 3: Element system (Detail module only)
  onAddElement?: () => void;
  onRemoveElement?: (elementId: string) => void;
  onUpdateElement?: (element: Element) => void;
  onToggleElementActive?: (elementId: string) => void;
  onToggleElementLock?: (elementId: string) => void;
}

const statusConfig: Record<ModuleStatus, { icon: React.ReactNode; label: string; className: string }> = {
  empty: {
    icon: <Circle className="w-4 h-4" />,
    label: 'Empty',
    className: 'text-muted-foreground',
  },
  active: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    label: 'Active',
    className: 'text-emerald-400',
  },
  locked: {
    icon: <Lock className="w-4 h-4 text-amber-400" />,
    label: 'Locked',
    className: 'text-amber-400',
  },
};

export function ModuleCard({
  moduleState,
  variantEditingLocked,
  onToggleExpand,
  onToggleSkip,
  onToggleLock,
  onSaveToLibrary,
  onCustomTextChange,
  onIntentDNAChange,
  onWorldDNAChange,
  onAtmosphereDNAChange,
  onAnchorDNAChange,
  onSubjectDNAChange,
  onColorDNAChange,
  onLightDNAChange,
  onCameraDNAChange,
  onFormatDNAChange,
  onStyleDNAChange,
  onMediumDNAChange,
  onFinishDNAChange,
  onExclusionDNAChange,
  isExpanded,
  onAddElement,
  onRemoveElement,
  onUpdateElement,
  onToggleElementActive,
  onToggleElementLock,
}: ModuleCardProps) {
  const { id, status, skipped, customText, intentDNA, worldDNA, atmosphereDNA, anchorDNA, subjectDNA, elements, colorDNA, lightDNA, cameraDNA, formatDNA, styleDNA, mediumDNA, finishDNA, exclusionDNA } = moduleState;
  const label = MODULE_LABELS[id];
  const statusInfo = statusConfig[status];

  if (skipped) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EyeOff className="w-4 h-4 text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground/60 line-through">{label}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSkip}
            className="text-xs h-7 text-muted-foreground hover:text-foreground"
          >
            Enable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`module-${id}`}
      className={`rounded-lg border transition-colors ${
        isExpanded
          ? 'border-border/80 bg-card'
          : 'border-border/40 bg-card/50 hover:border-border/70'
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={statusInfo.className}>{statusInfo.icon}</span>
          <span className="font-medium text-sm">{label}</span>
          <span className={`text-xs ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border/30">
          {/* Module controls */}
          <div className="flex items-center gap-2 pt-3 pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSkip}
              disabled={variantEditingLocked}
              className="text-xs h-7 border-muted-foreground/30"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Skip Module
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleLock}
              disabled={status === 'empty'}
              className="text-xs h-7 border-muted-foreground/30"
            >
              {status === 'locked' ? (
                <>
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Lock
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveToLibrary}
              className="text-xs h-7 border-muted-foreground/30"
            >
              <Dna className="w-3 h-3 mr-1" />
              Save DNA
            </Button>
          </div>

          {variantEditingLocked && (
            <div className="mb-3 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-400">
              Variant Lock is active. Unlock this module to edit it.
            </div>
          )}

          <fieldset disabled={variantEditingLocked} className={variantEditingLocked ? 'opacity-60' : ''}>

          {id === 'intent' && onIntentDNAChange && (
            <IntentDNAPanel dna={intentDNA ?? createEmptyIntentDNA()} onChange={onIntentDNAChange} />
          )}

          {id === 'world' && onWorldDNAChange && (
            <WorldDNAPanel dna={worldDNA ?? createEmptyWorldDNA()} onChange={onWorldDNAChange} />
          )}

          {id === 'atmosphere' && onAtmosphereDNAChange && (
            <AtmosphereDNAPanel dna={atmosphereDNA ?? createEmptyAtmosphereDNA()} onChange={onAtmosphereDNAChange} />
          )}

          {id === 'anchor' && onAnchorDNAChange && (
            <AnchorDNAPanel dna={anchorDNA ?? createEmptyAnchorDNA()} onChange={onAnchorDNAChange} />
          )}

          {/* Subject DNA Panel (Phase 2) */}
          {id === 'subject' && subjectDNA && onSubjectDNAChange && (
            <SubjectDNAPanel dna={subjectDNA} onChange={onSubjectDNAChange} />
          )}

          {/* Detail Module — Phase 3: Element System */}
          {id === 'detail' && (
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddElement}
                className="text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Element
              </Button>

              {elements && elements.length > 0 && (
                <div className="space-y-2">
                  {elements.map((elem, idx) => (
                    <ElementCard
                      key={elem.id}
                      element={elem}
                      index={idx}
                      onChange={(updated) => onUpdateElement?.(updated)}
                      onToggleActive={() => onToggleElementActive?.(elem.id)}
                      onToggleLock={() => onToggleElementLock?.(elem.id)}
                      onRemove={() => onRemoveElement?.(elem.id)}
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Custom text (contributes to prompt)</label>
                <textarea
                  value={customText}
                  onChange={(e) => onCustomTextChange(e.target.value)}
                  placeholder="Add custom instruction..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[60px] resize-y"
                />
              </div>
            </div>
          )}

          {/* Color Module — Phase 4: Color DNA */}
          {id === 'color' && colorDNA && onColorDNAChange && (
            <ColorDNAPanel dna={colorDNA} onChange={onColorDNAChange} />
          )}

          {/* Light Module — Phase 5: Light DNA */}
          {id === 'light' && lightDNA && onLightDNAChange && (
            <LightDNAPanel dna={lightDNA} onChange={onLightDNAChange} />
          )}

          {/* Camera Module — Phase 6: Camera + Composition DNA */}
          {id === 'camera' && onCameraDNAChange && (
            <CameraDNAPanel dna={cameraDNA ?? createEmptyCameraDNA()} onChange={onCameraDNAChange} />
          )}

          {id === 'format' && onFormatDNAChange && (
            <FormatDNAPanel dna={formatDNA ?? createEmptyFormatDNA()} onChange={onFormatDNAChange} />
          )}

          {/* Style Module — Phase 7: Style DNA */}
          {id === 'style' && styleDNA && onStyleDNAChange && (
            <StyleDNAPanel dna={styleDNA} onChange={onStyleDNAChange} />
          )}

          {/* Medium Module — Phase 7: Medium DNA */}
          {id === 'medium' && mediumDNA && onMediumDNAChange && (
            <MediumDNAPanel dna={mediumDNA} onChange={onMediumDNAChange} />
          )}

          {/* Finish Module — Phase 8: Finish DNA */}
          {id === 'finish' && onFinishDNAChange && (
            <FinishDNAPanel dna={finishDNA ?? createEmptyFinishDNA()} onChange={onFinishDNAChange} />
          )}

          {id === 'exclusions' && onExclusionDNAChange && (
            <ExclusionDNAPanel dna={exclusionDNA ?? createEmptyExclusionDNA()} onChange={onExclusionDNAChange} />
          )}

          {/* Custom text for DNA modules */}
          {(id === 'subject' || id === 'color' || id === 'light' || id === 'camera' || id === 'format' || id === 'style' || id === 'medium' || id === 'finish') && (
            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Custom text (contributes to prompt)</label>
              <textarea
                value={customText}
                onChange={(e) => onCustomTextChange(e.target.value)}
                placeholder="Add custom instruction..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[60px] resize-y"
              />
            </div>
          )}
          </fieldset>
        </div>
      )}
    </div>
  );
}
