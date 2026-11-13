import type { PracticeSession } from './practice';
export const PRACTICE_ORDER = ['understand', 'guess', 'walkthrough', 'code', 'bug', 'reveal', 'log'] as const;
export function canOpenPracticeStep(step: string, session: PracticeSession, needsComplexity = true) {
  return PRACTICE_ORDER.some(value => value === step);
}