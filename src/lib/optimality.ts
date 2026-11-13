import { z } from 'zod';
export const optimalitySchema = z.object({
  time_gap: z.enum(['optimal', 'minor', 'major', 'unknown']),
  space_gap: z.enum(['optimal', 'minor', 'major', 'unknown']),
  optimal_time: z.string(), optimal_space: z.string(), rationale: z.string(),
  steps: z.array(z.object({ question: z.string(), action: z.string() })).min(1).max(4),
});
export type Optimality = z.infer<typeof optimalitySchema>;
export function optimalityScore(verdict: string, assessment: Optimality) {
  if (verdict === 'Unclear' || assessment.time_gap === 'unknown' || assessment.space_gap === 'unknown') return null;
  const time = { optimal: 35, minor: 25, major: 10 }[assessment.time_gap];
  const space = { optimal: 15, minor: 10, major: 5 }[assessment.space_gap];
  const correctness = verdict === 'Looks correct' ? 50 : 0;
  return { total: correctness + time + space, correctness, time, space };
}