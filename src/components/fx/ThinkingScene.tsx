import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIPS = [
  { tag: "Complexity fact", title: "Double the input. What happens?", body: "A linear algorithm does roughly twice the work. A quadratic one does roughly four times the work. Nested loops over the whole input are a clue to O(n²), not a guarantee.", clue: "Count how much work each loop actually does.", visual: ["n = 100", "O(n): 100", "O(n²): 10,000"] },
  { tag: "Pattern clue", title: "Looking for a matching pair?", body: "When you need a complement, like target − current value, a hash map can remember what you have already seen instead of searching the whole array again.", clue: "Hash lookups are O(1) on average; extra memory is the trade-off.", visual: ["target: 9", "current: 7", "look for: 2"] },
  { tag: "Pattern clue", title: "Sorted input is a big hint.", body: "For a target pair in a sorted array, try two pointers. Too small? Move the left pointer. Too large? Move the right. Each move rules out candidates.", clue: "Sorting an unsorted input first typically costs O(n log n).", visual: ["2 →", "4", "7", "← 11"] },
  { tag: "Pattern clue", title: "A contiguous stretch? Think window.", body: "Substring and subarray problems often fit a sliding window. Expand to include an item and shrink when a condition breaks. It works when window validity can be maintained as the boundaries move.", clue: "Negative numbers can break simple sum-based sliding windows.", visual: ["expand →", "[ a b c ]", "← shrink"] },
  { tag: "Complexity fact", title: "Halving beats scanning.", body: "Binary search cuts the remaining candidates in half each step. Among 1,024 items, about 10 halvings narrow the search to one candidate.", clue: "Use it on sorted data or an answer space with a monotonic yes/no condition.", visual: ["1,024", "512", "256", "… 1"] },
  { tag: "Pattern clue", title: "Last opened, first closed.", body: "Brackets, undo operations and nested structures often need a stack. The most recently stored item is the first one you take back out.", clue: "For matching brackets, store the opening symbols and check each closing symbol.", visual: ["push (", "push [", "pop ]", "pop )"] },
  { tag: "Pattern clue", title: "Shortest path, equal-cost steps?", body: "Breadth-first search explores a graph layer by layer. It finds a shortest path by edge count when all edges have equal cost.", clue: "For nonnegative, unequal edge weights, consider Dijkstra instead.", visual: ["start", "1 step", "2 steps", "goal"] },
  { tag: "Pattern clue", title: "Solving the same smaller problem again?", body: "Repeated subproblems can be a clue for dynamic programming. Store each result, then reuse it rather than recomputing it.", clue: "Define the state, the transition and the base case before writing code.", visual: ["solve", "store", "reuse"] },
];

/** Local learning bites appear immediately, without another AI request. */
export function ThinkingScene() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(() => setI((x) => (x + 1) % TIPS.length), 12000);
    return () => clearInterval(id);
  }, [paused, reducedMotion, i]);
  const tip = TIPS[i];
  if (!tip) return null;

  return (
    <section aria-label="Algorithm tips while waiting" className="mt-10 border-y py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 motion-safe:animate-spin" /> Preparing your breakdown…</p>
        <span className="text-xs text-muted-foreground">A little insight while you wait</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={i} initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }} className="grid min-h-72 items-center gap-6 py-6 md:grid-cols-[1fr_220px]">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><Lightbulb className="h-4 w-4" /> {tip.tag}</p>
            <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{tip.title}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
            <p className="mt-4 border-l-2 border-primary pl-3 text-sm font-medium">{tip.clue}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:flex-col" aria-hidden="true">
            {tip.visual.map((label, index) => (
              <motion.div key={label} initial={{ opacity: 0, x: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reducedMotion ? 0 : index * 0.15 }} className="rounded-md bg-highlight px-4 py-3 text-center font-mono text-sm font-semibold text-highlight-foreground">{label}</motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")} / {String(TIPS.length).padStart(2, "0")}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous tip" title="Previous tip" onClick={() => setI((x) => (x - 1 + TIPS.length) % TIPS.length)}><ArrowLeft className="h-4 w-4" /></Button>
          {!reducedMotion && <Button variant="ghost" size="icon" aria-label={paused ? "Resume tips" : "Pause tips"} title={paused ? "Resume tips" : "Pause tips"} onClick={() => setPaused((p) => !p)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>}
          <Button variant="ghost" size="icon" aria-label="Next tip" title="Next tip" onClick={() => setI((x) => (x + 1) % TIPS.length)}><ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </section>
  );
}
