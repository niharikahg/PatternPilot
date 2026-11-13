const KEY = "patternpilot-waiting-questions-v1";
let fallbackSeen: number[] = [];

/** Random sampling without replacement; only question indices are stored. */
export function drawWaitingQuestion(count: number, storage?: Pick<Storage, "getItem" | "setItem">, random = Math.random): number | null {
  let seen = fallbackSeen;
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(KEY) ?? "[]");
    if (Array.isArray(parsed)) seen = parsed.filter((x): x is number => Number.isInteger(x) && x >= 0 && x < count);
  } catch { /* Storage may be unavailable; keep the in-memory history. */ }
  const remaining = Array.from({ length: count }, (_, i) => i).filter((i) => !seen.includes(i));
  const next = remaining[Math.floor(random() * remaining.length)];
  if (next === undefined) return null;
  fallbackSeen = [...seen, next];
  try { storage?.setItem(KEY, JSON.stringify(fallbackSeen)); } catch { /* No personal data or network fallback. */ }
  return next;
}