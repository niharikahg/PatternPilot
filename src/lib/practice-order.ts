import type { PracticeSession } from './practice';
export const PRACTICE_ORDER = ['understand', 'walkthrough', 'code', 'bug', 'guess', 'reveal', 'log'] as const;
export function canOpenPracticeStep(step: string, session: PracticeSession, needsComplexity = true) {
  if (step !== 'reveal' && step !== 'log') return true;
  return Boolean(session.patternGuess && (!needsComplexity || session.complexityGuess));
}