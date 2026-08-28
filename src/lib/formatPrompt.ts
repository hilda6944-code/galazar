import type { FormatDNA } from '../types/galazar.ts';

export function assembleFormatPrompt(dna: FormatDNA): string {
  switch (dna.format) {
    case 'Square — 1:1': return 'square composition, 1:1 aspect ratio';
    case 'Portrait — 4:5': return 'portrait composition, 4:5 aspect ratio';
    case 'Story / Vertical — 9:16': return 'vertical story composition, 9:16 aspect ratio';
    case 'Classic Portrait — 3:4': return 'classic portrait composition, 3:4 aspect ratio';
    case 'Landscape — 16:9': return 'landscape composition, 16:9 aspect ratio';
    case 'Standard Photo — 3:2': return 'standard photographic composition, 3:2 aspect ratio';
    case 'Classic Landscape — 4:3': return 'classic landscape composition, 4:3 aspect ratio';
    case 'Ultrawide — 21:9': return 'ultrawide cinematic composition, 21:9 aspect ratio';
    case 'Banner / Wide': return 'wide banner composition';
    case 'Custom': return dna.customFormat.trim();
    default: return '';
  }
}
