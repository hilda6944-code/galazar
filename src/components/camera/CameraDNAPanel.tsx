import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { LockToggle } from '@/components/subject/LockToggle';
import { type CameraDNA } from '@/types/galazar';

interface CameraDNAPanelProps {
  dna: CameraDNA;
  onChange: (dna: CameraDNA) => void;
}

const CAMERA_MODES = ['Photography', 'Cinematic', 'Painterly / Virtual Camera', 'Illustrative Composition'];

const LENSES = [
  'Ultra Wide 14mm',
  'Wide 24mm',
  'Environmental 35mm',
  'Natural 50mm',
  'Portrait 85mm',
  'Portrait Telephoto 105mm',
  'Telephoto 135mm',
  'Telephoto 200mm',
  'Macro',
  'Fisheye',
  'Orthographic / No Perspective Distortion',
  'Custom',
];

const ANGLES = [
  'Eye Level',
  'Low Angle',
  'High Angle',
  "Bird's-Eye",
  "Worm's-Eye",
  'Ground Level',
  'Overhead / Top-Down',
  'Dutch Angle',
  'Over-the-Shoulder',
  'Profile View',
  'Three-Quarter View',
  'Front Facing',
  'Rear View',
  'Custom',
];

const SHOT_SIZES = [
  'Extreme Close-Up',
  'Close-Up',
  'Head and Shoulders',
  'Bust Portrait',
  'Medium Close-Up',
  'Medium Shot',
  'Three-Quarter Shot',
  'Full Body',
  'Wide Shot',
  'Extreme Wide Shot',
  'Environmental Portrait',
  'Custom',
];

const DEPTH_OF_FIELDS = [
  'Deep Focus',
  'Moderate Depth',
  'Shallow Depth',
  'Very Shallow Depth',
  'Selective Focus',
  'Tilt-Shift Focus Plane',
  'Painterly Focus Falloff',
  'Uniform Sharpness',
  'Custom',
];

const FOCUS_TARGETS = [
  'Eyes',
  'Face',
  'Primary Subject',
  'Foreground',
  'Midground',
  'Background',
  'Hands',
  'Object / Prop',
  'Custom',
];

const COMPOSITIONS = [
  'Centered',
  'Leading Lines',
  'Rule of Thirds',
  'Golden Ratio',
  'Golden Spiral',
  'Symmetrical',
  'Asymmetrical Balance',
  'Diagonal Composition',
  'Triangular Composition',
  'Layered Depth',
  'Frame Within a Frame',
  'Negative Space',
  'Radial Composition',
  'S-Curve',
  'L-Composition',
  'Central Monumental',
  'Editorial Crop',
  'Partial Reveal',
  'Environmental Framing',
  'Custom',
];

const SUBJECT_PLACEMENTS = [
  'Center',
  'Left Third',
  'Right Third',
  'Upper Third',
  'Lower Third',
  'Off-Center Left',
  'Off-Center Right',
  'Near Frame Edge',
  'Deep in Frame',
  'Custom',
];

const GAZE_DIRECTIONS = [
  'Direct to Viewer',
  'Looking Left',
  'Looking Right',
  'Looking Up',
  'Looking Down',
  'Looking Away',
  'Looking Toward Subject',
  'Looking Into Distance',
  'Custom',
];

const FRAME_ORIENTATIONS = [
  'Portrait / Vertical',
  'Landscape / Horizontal',
  'Square',
  'Panoramic',
  'Custom',
];

const BREATHING_ROOMS = ['Tight', 'Balanced', 'Generous', 'Expansive', 'Custom'];

const PERSPECTIVE_EMPHASES = [
  'Flat / Graphic',
  'Subtle Depth',
  'Natural Depth',
  'Strong Depth',
  'Exaggerated Depth',
  'Compressed Depth',
  'Custom',
];

export function CameraDNAPanel({ dna, onChange }: CameraDNAPanelProps) {
  const update = (partial: Partial<CameraDNA>) => {
    onChange({ ...dna, ...partial });
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Camera Mode */}
      <SelectControl
        label="Camera Mode"
        value={dna.cameraMode}
        options={CAMERA_MODES}
        onChange={(v) => update({ cameraMode: v })}
      />

      {/* Camera Lock */}
      <div className="pt-1">
        <LockToggle
          label="Camera Lock"
          locked={dna.cameraLock}
          onToggle={() => update({ cameraLock: !dna.cameraLock })}
        />
      </div>

      {/* Shot Size / Camera Distance */}
      <SelectControl
        label="Shot Size / Camera Distance"
        value={dna.shotSize}
        options={SHOT_SIZES}
        onChange={(v) => update({ shotSize: v })}
      />
      {dna.shotSize === 'Custom' && (
        <TypedField label="Custom Shot Size" value={dna.customShotSize} onChange={(v) => update({ customShotSize: v })} placeholder="Describe shot size..." />
      )}

      {/* Camera Angle */}
      <SelectControl
        label="Camera Angle / Viewpoint"
        value={dna.angle}
        options={ANGLES}
        onChange={(v) => update({ angle: v })}
      />
      {dna.angle === 'Custom' && (
        <TypedField label="Custom Angle" value={dna.customAngle} onChange={(v) => update({ customAngle: v })} placeholder="Describe camera angle..." />
      )}

      {/* Focus Target */}
      <SelectControl
        label="Focus Target"
        value={dna.focusTarget}
        options={FOCUS_TARGETS}
        onChange={(v) => update({ focusTarget: v })}
      />
      {dna.focusTarget === 'Custom' && (
        <TypedField label="Custom Focus Target" value={dna.customFocusTarget} onChange={(v) => update({ customFocusTarget: v })} placeholder="Describe focus target..." />
      )}

      {/* Composition Structure */}
      <SelectControl
        label="Composition Structure"
        value={dna.composition}
        options={COMPOSITIONS}
        onChange={(v) => update({ composition: v })}
      />
      {dna.composition === 'Custom' && (
        <TypedField label="Custom Composition" value={dna.customComposition} onChange={(v) => update({ customComposition: v })} placeholder="Describe composition..." />
      )}

      {/* Subject Placement */}
      <SelectControl
        label="Subject Placement"
        value={dna.subjectPlacement}
        options={SUBJECT_PLACEMENTS}
        onChange={(v) => update({ subjectPlacement: v })}
      />
      {dna.subjectPlacement === 'Custom' && (
        <TypedField label="Custom Placement" value={dna.customSubjectPlacement} onChange={(v) => update({ customSubjectPlacement: v })} placeholder="Describe placement..." />
      )}

      {/* Depth of Field */}
      <SelectControl
        label="Depth of Field / Focus Behavior"
        value={dna.depthOfField}
        options={DEPTH_OF_FIELDS}
        onChange={(v) => update({ depthOfField: v })}
      />
      {dna.depthOfField === 'Custom' && (
        <TypedField label="Custom Depth of Field" value={dna.customDepthOfField} onChange={(v) => update({ customDepthOfField: v })} placeholder="Describe depth behavior..." />
      )}

      {/* Lens / Field of View */}
      <SelectControl
        label="Lens / Field of View"
        value={dna.lens}
        options={LENSES}
        onChange={(v) => update({ lens: v })}
      />
      {dna.lens === 'Custom' && (
        <TypedField label="Custom Lens" value={dna.customLens} onChange={(v) => update({ customLens: v })} placeholder="Describe lens behavior..." />
      )}

      {/* Gaze / Direction */}
      <SelectControl
        label="Gaze / Direction"
        value={dna.gazeDirection}
        options={GAZE_DIRECTIONS}
        onChange={(v) => update({ gazeDirection: v })}
      />
      {dna.gazeDirection === 'Custom' && (
        <TypedField label="Custom Gaze Direction" value={dna.customGazeDirection} onChange={(v) => update({ customGazeDirection: v })} placeholder="Describe gaze direction..." />
      )}

      {/* Frame Orientation */}
      <SelectControl
        label="Frame Orientation"
        value={dna.frameOrientation}
        options={FRAME_ORIENTATIONS}
        onChange={(v) => update({ frameOrientation: v })}
      />
      {dna.frameOrientation === 'Custom' && (
        <TypedField label="Custom Orientation" value={dna.customFrameOrientation} onChange={(v) => update({ customFrameOrientation: v })} placeholder="Describe orientation..." />
      )}

      {/* Breathing Room */}
      <SelectControl
        label="Breathing Room"
        value={dna.breathingRoom}
        options={BREATHING_ROOMS}
        onChange={(v) => update({ breathingRoom: v })}
      />
      {dna.breathingRoom === 'Custom' && (
        <TypedField label="Custom Breathing Room" value={dna.customBreathingRoom} onChange={(v) => update({ customBreathingRoom: v })} placeholder="Describe breathing room..." />
      )}

      {/* Perspective Emphasis */}
      <SelectControl
        label="Perspective / Depth Emphasis"
        value={dna.perspectiveEmphasis}
        options={PERSPECTIVE_EMPHASES}
        onChange={(v) => update({ perspectiveEmphasis: v })}
      />
      {dna.perspectiveEmphasis === 'Custom' && (
        <TypedField label="Custom Perspective" value={dna.customPerspectiveEmphasis} onChange={(v) => update({ customPerspectiveEmphasis: v })} placeholder="Describe perspective..." />
      )}
    </div>
  );
}
