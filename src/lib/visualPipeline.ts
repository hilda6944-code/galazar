export const VISUAL_PIPELINE_STAGES = [
  {
    id: 'visual-evaluator',
    label: 'Visual Evaluator',
    instructions: [
      'Evaluate the supplied image against the intended visual result.',
      'Inspect the image deliberately for anatomy, fabric and material physics, lighting consistency, perspective and depth, attachment and contact, subject/environment integration, and overall visual coherence.',
      'Identify concrete visual strengths, defects, and mismatches without rewriting the image prompt.',
      'Do not assume an element is correct merely because the overall image is attractive. Examine whether forms are physically plausible, properly attached, correctly lit, spatially integrated, and structurally believable.',
      'If a defect is visible, describe it specifically and state why it matters. If no defect is found in a category, do not invent one.',
      'For hands and anatomy, explicitly check finger count, finger separation, joint structure, palm orientation, grip and contact, and whether fingers or limbs merge into clothing, props, or nearby objects.',
      'When anatomy, attachment, grip, or contact is visually ambiguous, treat that ambiguity as a defect candidate to investigate rather than assuming it is intentional stylization.',
      'Return a concise evidence-based evaluation for the Decision stage.',
    ],
  },
  {
    id: 'decision',
    label: 'Decision',
    instructions: [
      'Classify the evaluated image as PASS, PASS WITH ONE CORRECTION, or FAIL.',
      'Use PASS only when no meaningful visual correction is required. A visually attractive image must not PASS if it contains a visible structural, anatomical, material, lighting, perspective, depth, attachment, or physical-realism defect.',
      'Use PASS WITH ONE CORRECTION when one localized correction objective is sufficient and the rest of the image should remain unchanged.',
      'Use FAIL when two or more unrelated correction objectives are required, or when the problem affects broader composition, lighting, anatomy, material behavior, perspective, subject/environment integration, or visual coherence.',
      'Do not excuse a visible defect merely because the overall image is beautiful, stylistic, or emotionally successful.',
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