export const GROWTH = ["1", "logn", "n", "nlogn", "n^2", "n^3", "2^n"] as const;
export type Growth = (typeof GROWTH)[number];
export const GROWTH_LABEL: Record<Growth, string> = {
  "1": "O(1)", logn: "O(log n)", n: "O(n)", nlogn: "O(n log n)", "n^2": "O(n²)", "n^3": "O(n³)", "2^n": "O(2ⁿ)",
};

/** Operation count for a growth class at input size n (capped so 2^n stays finite). */
export function opsFor(g: Growth, n: number): number {
  const lg = Math.max(1, Math.log2(Math.max(2, n)));
  switch (g) {
    case "1": return 1;
    case "logn": return Math.ceil(lg);
    case "n": return n;
    case "nlogn": return Math.ceil(n * lg);
    case "n^2": return n * n;
    case "n^3": return n * n * n;
    case "2^n": return Math.pow(2, Math.min(n, 1000));
  }
}

export function formatOps(x: number): string {
  if (!isFinite(x) || x > 1e15) return "∞-ish";
  if (x >= 1e9) return (x / 1e9).toFixed(1) + "B";
  if (x >= 1e6) return (x / 1e6).toFixed(1) + "M";
  if (x >= 1e3) return (x / 1e3).toFixed(1) + "K";
  return String(Math.round(x));
}

/** Combo grows by 1 on a correct answer and resets to 0 on a miss. */
export function nextCombo(combo: number, correct: boolean): number {
  return correct ? combo + 1 : 0;
}

/** Intuition score 0-100 = share of predictions right on the first try. */
export function intuitionScore(correct: number, attempts: number): number {
  return attempts ? Math.round((correct / attempts) * 100) : 0;
}
