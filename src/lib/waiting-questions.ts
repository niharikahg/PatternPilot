const KEY = "patternpilot-waiting-questions-v2";
type History = { cycle: string; remaining: number[] };
let fallback: History = { cycle: "0", remaining: [] };
export type WaitingQuestion = { id: string; tipIndex: number; prompt: string; options: string[]; answer: number; explanation: string };

/** Shuffle concept families, then create fresh concrete examples locally forever. */
export function drawWaitingQuestion(storage?: Pick<Storage, "getItem" | "setItem">, random = Math.random): WaitingQuestion {
  let history = fallback;
  try {
    const parsed = JSON.parse(storage?.getItem(KEY) ?? "null") as History | null;
    if (parsed && /^\d+$/.test(parsed.cycle) && Array.isArray(parsed.remaining) && parsed.remaining.every((n) => Number.isInteger(n) && n >= 0 && n < 8) && new Set(parsed.remaining).size === parsed.remaining.length) history = parsed;
  } catch { /* Keep working without storage. */ }
  let cycle = BigInt(history.cycle);
  let remaining = [...history.remaining];
  if (!remaining.length) { cycle += 1n; remaining = Array.from({ length: 8 }, (_, i) => i); }
  const index = Math.min(remaining.length - 1, Math.max(0, Math.floor(random() * remaining.length)));
  const family = remaining[index] ?? 0;
  remaining.splice(index, 1);
  fallback = { cycle: String(cycle), remaining };
  try { storage?.setItem(KEY, JSON.stringify(fallback)); } catch { /* No extra requests or personal information. */ }
  const n = cycle + 2n;
  const examples = [
    { prompt: `An O(n²) algorithm handles ${n} items. If the input doubles to ${2n * n}, how does its leading-order work change?`, options: ["2 times", "4 times", "No change"], answer: 1, explanation: "Squaring twice the input gives (2n)² = 4n²: roughly four times the work." },
    { prompt: `Your target is ${3n * n + 1n} and the current value is ${n}. Which missing value completes the pair?`, options: [String(4n * n + 1n), String(2n * n + 1n), String(n)], answer: 1, explanation: `${3n * n + 1n} − ${n} = ${2n * n + 1n}. Check previously seen values for that complement.` },
    { prompt: `Sorted values are [${n}, ${n + 2n}, ${n + 5n}, ${n + 9n}]. The outer pair is below target ${2n * n + 10n}. What change would increase the pair sum?`, options: ["Increase the smaller value", "Decrease the larger value", "Stop searching"], answer: 0, explanation: "The sum is too small. Increasing the smaller value raises it; decreasing the larger value lowers it." },
    { prompt: `A collection has ${n} distinct items. You append one new, different item. How many distinct items are now in the collection?`, options: [String(n), String(n + 1n), String(n - 1n)], answer: 1, explanation: `A new distinct item increases the count from ${n} to ${n + 1n}. Keep track of which items are currently included.` },
    { prompt: `A search has ${2n * n} candidates. One step keeps exactly half. How many candidates remain?`, options: [String(2n * n - 1n), String(n), String(2n * n)], answer: 1, explanation: `${2n * n} ÷ 2 = ${n}. Halving the candidate range each step is the key to reducing repeated work.` },
    { prompt: `Place task #${n}, then task #${n + 1n} onto a pile. If you remove from the top, which task comes first?`, options: [`Task #${n}`, `Task #${n + 1n}`, "Neither"], answer: 1, explanation: `The last task placed on top is removed first, so task #${n + 1n} comes out before task #${n}.` },
    { prompt: `An unweighted chain has ${n + 1n} vertices. How many edges are on the shortest path from the first vertex to the last?`, options: [String(n + 1n), String(n), String(n + 2n)], answer: 1, explanation: `A chain of ${n + 1n} vertices has ${n} connecting edges. Counting the connecting edges gives the distance.` },
    { prompt: `Recursion requests the same state ${n} times. If saved results are reused, how many times must that state's result be computed?`, options: [String(n), "Once", String(n + 1n)], answer: 1, explanation: "Compute the state once and cache it. Subsequent requests reuse the stored result instead of recomputing it." },
  ];
  const example = examples[family] ?? examples[0];
  if (!example) throw new Error("Question family unavailable");
  // Shuffle answers as well as concepts.
  const options = [...example.options];
  const correct = options[example.answer];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    const a = options[i]; const b = options[j];
    if (a !== undefined && b !== undefined) { options[i] = b; options[j] = a; }
  }
  return { ...example, options, answer: options.findIndex((option) => option === correct), tipIndex: family, id: `${cycle}-${family}` };
}