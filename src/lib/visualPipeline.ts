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
      'Return correctionObjectives as the smallest set of independent repair objectives. Consolidate related observations into one objective when one localized edit can resolve them together.',
      'Return an empty correctionObjectives array and PASS when no meaningful visual correction is required.',
      'Return exactly one correction objective and PASS WITH ONE CORRECTION when one localized repair is sufficient and the rest of the image should remain unchanged.',
      'Set imageWideProblem to true only when one problem genuinely affects the image as a whole, such as global composition, global lighting, overall perspective, or pervasive visual coherence.',
      'Use FAIL only when correctionObjectives contains two or more unrelated repair objectives or imageWideProblem is true.',
      'The application validates the final decision from correctionObjectives and imageWideProblem; do not inflate one localized repair into FAIL.',
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
