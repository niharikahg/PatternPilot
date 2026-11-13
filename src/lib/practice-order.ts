import type { PracticeSession } from './practice';
export const PRACTICE_ORDER = ['understand', 'guess', 'walkthrough', 'code', 'bug', 'reveal', 'log'] as const;
export function canOpenPracticeStep(step: string, session: PracticeSession, needsComplexity = true) {
  if (!['walkthrough','code','bug','reveal','log'].includes(step)) return true;
  return Boolean(session.patternGuess && (!needsComplexity || session.complexityGuess));
}