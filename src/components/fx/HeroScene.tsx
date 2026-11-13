import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ARR = [2, 7, 11, 15, 19, 24];
const TARGET = 26;

/** Live animated two-pointer demo + orbiting pattern chips. */
export function HeroScene() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT((x) => (x + 1) % 4), 1300); return () => clearInterval(id); }, []);
  const steps: [number, number][] = [[0, 5], [0, 4], [1, 4], [1, 4]];
  const [l, r] = steps[t]!;
  const sum = ARR[l]! + ARR[r]!;
  const found = t === 3;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* orbit rings */}
      {[0, 1].map((k) => (
        <motion.div key={k} className="absolute inset-0 rounded-full border border-dashed border-foreground/15"
          style={{ margin: k * 48 }} animate={{ rotate: k ? -360 : 360 }} transition={{ duration: 40 + k * 20, repeat: Infinity, ease: "linear" }} />
      ))}
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {["Sliding Window", "BFS", "DP", "Heap", "Binary Search", "Backtrack"].map((p, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <motion.span key={p} className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border bg-card px-3 py-1 text-xs font-semibold shadow-pop"
              style={{ left: `${50 + 48 * Math.cos(a)}%`, top: `${50 + 48 * Math.sin(a)}%` }}
              animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
              {p}
            </motion.span>
          );
        })}
      </motion.div>

      {/* center card */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}
        className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-card p-5 shadow-pop">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Two Pointers · live</span><span className="font-mono">target = {TARGET}</span>
        </div>
        <div className="relative mt-6 grid grid-cols-6 gap-1.5">
          {ARR.map((v, i) => {
            const on = i === l || i === r;
            return (
              <motion.div key={i} animate={{ y: on ? -6 : 0, scale: on ? 1.08 : 1 }}
                className={"grid h-11 place-items-center rounded-xl border font-mono text-sm font-bold transition-colors " + (on ? (found ? "bg-highlight text-highlight-foreground border-transparent" : "bg-foreground text-background border-transparent") : "bg-muted")}>
                {v}
              </motion.div>
            );
          })}
        </div>
        <div className="relative mt-1 h-6 font-mono text-xs font-bold">
          <motion.span className="absolute text-primary" animate={{ left: `${(l / 6) * 100 + 5}%` }} transition={{ type: "spring", stiffness: 200 }}>▲ L</motion.span>
          <motion.span className="absolute text-coral" animate={{ left: `${(r / 6) * 100 + 5}%` }} transition={{ type: "spring", stiffness: 200 }}>▲ R</motion.span>
        </div>
        <motion.div key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-xl bg-muted px-3 py-2 font-mono text-xs">
          {ARR[l]} + {ARR[r]} = {sum} {found ? "🎉 found it!" : sum > TARGET ? "→ too big, move R" : "→ too small, move L"}
        </motion.div>
      </motion.div>

      {found && [...Array(8)].map((_, i) => (
        <motion.span key={i} className="absolute left-1/2 top-1/2 text-xl" initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: Math.cos(i) * 160, y: Math.sin(i) * 160, opacity: 0 }} transition={{ duration: 1 }}>✦</motion.span>
      ))}
    </div>
  );
}
