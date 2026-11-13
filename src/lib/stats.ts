export type LoggedProblem = { pattern: string; confidence: number };

export type PatternStat = { pattern: string; count: number; avgConfidence: number };

export function patternBreakdown(rows: LoggedProblem[]): PatternStat[] {
  const map = new Map<string, { count: number; total: number }>();
  for (const r of rows) {
    const m = map.get(r.pattern) ?? { count: 0, total: 0 };
    m.count += 1;
    m.total += r.confidence;
    map.set(r.pattern, m);
  }
  return [...map.entries()]
    .map(([pattern, m]) => ({ pattern, count: m.count, avgConfidence: m.total / m.count }))
    .sort((a, b) => b.count - a.count);
}

/** Weakest = lowest average confidence; ties broken by fewer problems practiced. */
export function weakestPatterns(rows: LoggedProblem[], limit = 3): PatternStat[] {
  return patternBreakdown(rows)
    .sort((a, b) => a.avgConfidence - b.avgConfidence || a.count - b.count)
    .slice(0, limit);
}
