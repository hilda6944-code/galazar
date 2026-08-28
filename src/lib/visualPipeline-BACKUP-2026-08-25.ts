export const VISUAL_PIPELINE_STAGES = [
  {
    id: 'visual-evaluator',
    label: 'Visual Evaluator',
    instructions: [
      'Evaluate the supplied image against the intended visual result.',
      'Identify concrete visual strengths, defects, and mismatches without rewriting the image prompt.',
      'Return a concise evidence-based evaluation for the Decision stage.',
    ],
  },
  {
    id: 'decision',
    label: 'Decision',
    instructions: [
      'Classify the evaluated image as PASS, PASS WITH ONE CORRECTION, or FAIL.',
      'Use PASS only when no edit is required.',
      'Use PASS WITH ONE CORRECTION when one precise correction is sufficient; use FAIL when broader improvement is required.',
    ],
  },
  {
    id: 'candidate-improvement',
    label: 'Candidate Improvement',
    instructions: [
      'Run only for PASS WITH ONE CORRECTION or FAIL.',
      'Convert the evaluation into the smallest clear set of image improvements.',
      'Preserve successful visual qualities and avoid unrelated changes.',
    ],
  },
  {
    id: 'final-edit-prompt',
    label: 'Final Edit Prompt',
    instructions: [
      'Turn the approved candidate improvement into a direct, executable image-edit prompt.',
      'State what must change and what must remain preserved.',
      'Output only the final edit instructions needed by a future image-editing system.',
    ],
  },
] as const;

export const VISUAL_PIPELINE_DECISION_RULES = [
  'PASS → Stop',
  'PASS WITH ONE CORRECTION or FAIL → Continue to Candidate Improvement → Final Edit Prompt',
] as const;

