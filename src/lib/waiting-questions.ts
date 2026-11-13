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
    {prompt:`An input contains ${n} values. You add one value. How many values are there?`,options:[String(n),String(n+1n),String(n+2n)],answer:1,explanation:'Adding one increases the count by one.'},
    {prompt:`A target is ${3n*n+1n}. One chosen number is ${n}. Which number completes the sum?`,options:[String(4n*n+1n),String(2n*n+1n),String(n)],answer:1,explanation:`Subtract the known number: ${3n*n+1n} − ${n} = ${2n*n+1n}.`},
    {prompt:`Values are [${n}, ${n+2n}, ${n+5n}]. Which is largest?`,options:[String(n),String(n+2n),String(n+5n)],answer:2,explanation:'Compare the values directly; the last value here is the largest.'},
    {prompt:`A collection has ${n} distinct values. You add a repeat of an existing value. How many distinct values remain?`,options:[String(n),String(n+1n),String(n-1n)],answer:0,explanation:'Repeating an existing value does not add a new distinct value.'},
    {prompt:`You inspect ${n} items out of ${2n*n}. How many are left to inspect?`,options:[String(n),String(n+1n),String(2n*n)],answer:0,explanation:`${2n*n} − ${n} = ${n}.`},
    {prompt:`A list contains ${n} items. What is the last index when indexing begins at zero?`,options:[String(n),String(n-1n),String(n+1n)],answer:1,explanation:'Zero-based indices run from zero through length minus one.'},
    {prompt:`The smallest allowed input has ${n} items. Does an input of ${n-1n} items satisfy that constraint?`,options:['Yes','No','Always'],answer:1,explanation:'An input below the stated minimum does not satisfy the constraint.'},
    {prompt:`The required result contains ${n} items. Your result contains ${n+1n}. Does its length match?`,options:['Yes','No','Cannot compare'],answer:1,explanation:'The result has one extra item, so the lengths do not match.'},
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