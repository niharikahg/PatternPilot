import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LINES = ["Reading the problem…", "Spotting the constraints…", "Hunting for the pattern…", "Writing the story…", "Racing the complexities…", "Polishing the solution…"];

/** Immersive loader: a neural-ish graph that lights up while the AI thinks. */
export function ThinkingScene() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % LINES.length), 1800); return () => clearInterval(id); }, []);
  const nodes = Array.from({ length: 9 }, (_, k) => ({ x: 15 + (k % 3) * 35, y: 20 + Math.floor(k / 3) * 30 }));
  const edges: [number, number][] = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 5], [4, 6], [4, 7], [4, 8], [0, 1], [6, 7], [2, 5]];

  return (
    <div className="surface relative mt-10 overflow-hidden p-8">
      <div className="bg-hero pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <svg viewBox="0 0 100 90" className="mx-auto h-56 w-full max-w-sm">
          {edges.map(([a, b], k) => (
            <motion.line key={k} x1={nodes[a]!.x} y1={nodes[a]!.y} x2={nodes[b]!.x} y2={nodes[b]!.y}
              stroke="currentColor" strokeWidth={0.6} className="text-foreground/30"
              initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.18 }} />
          ))}
          {nodes.map((n, k) => (
            <motion.circle key={k} cx={n.x} cy={n.y} r={k === 4 ? 6 : 3.5}
              className={k === 4 ? "fill-highlight" : "fill-foreground"}
              animate={{ scale: [1, 1.4, 1] }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.15 }} />
          ))}
        </svg>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">PatternPilot is thinking</p>
          <motion.h3 key={i} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{LINES[i]}</motion.h3>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-highlight" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
