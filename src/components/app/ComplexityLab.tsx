import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Lock, Check, X } from "lucide-react";
import { guessState } from "@/lib/guess-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { GROWTH, GROWTH_LABEL, formatOps, opsFor, linearPercent, type Growth } from "@/lib/game";
import type { ComplexityLab as Lab } from "@/lib/types";

const SIZES = [10, 100, 1_000, 10_000, 100_000, 1_000_000];

function Lane({ label, g, n, max, unit = "ops" }: { label: string; g: Growth; n: number; max: number; unit?: string }) {
  const ops = opsFor(g, n);
  const pct = linearPercent(ops, max);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label} <span className="font-mono text-muted-foreground">{GROWTH_LABEL[g]}</span></span>
        <span className="font-mono">{formatOps(ops)} {unit}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <motion.div className={cn("h-full rounded-full", label === "Slow way" ? "bg-destructive" : "bg-primary")} initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  );
}

export function ComplexityLab({ lab, code, onAnswer, mode = "full", initialBet, onBet }: { lab: Lab; code: string; onAnswer: (correct: boolean) => void; mode?: "guess" | "reveal" | "full"; initialBet?: Growth | undefined; onBet?: (bet: Growth) => void }) {
  const [bet, setBet] = useState<Growth | null>(initialBet ?? null);
  const [locked, setLocked] = useState(Boolean(initialBet));
  const [idx, setIdx] = useState(2);
  const [tapped, setTapped] = useState<number[]>([]);
  const [hotScored, setHotScored] = useState(false);
  const n = SIZES[idx] ?? 1000;
  const max = Math.max(opsFor(lab.brute_force_time, n), 1);
  const lines = code.split("\n");
  const hot = new Map(lab.code_hotspots.map((h) => [h.line, h]));

  const lock = () => { if (!bet) return; setLocked(true); onBet?.(bet); onAnswer(bet === lab.optimized_time); };
  const tap = (l: number) => {
    if (tapped.includes(l)) return;
    setTapped([...tapped, l]);
    if (!hotScored) { setHotScored(true); onAnswer(hot.has(l)); }
  };

  return (
    <section className="surface p-5">
      <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /><h3 className="text-sm font-medium">Complexity Lab</h3></div>

      <>
      <p className="mt-4 text-sm font-medium">Time complexity prediction</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {GROWTH.map((g) => (
          <Button variant="outline" key={g} aria-pressed={bet===g} disabled={locked} onClick={() => {setBet(g);setLocked(true);onBet?.(g);onAnswer(g===lab.optimized_time);}}
            className={cn("rounded-md border px-3 py-2 font-mono text-sm transition-colors disabled:opacity-100",
              !locked && bet === g && "border-primary bg-primary-soft ring-2 ring-primary",
              locked && guessState(g,bet,lab.optimized_time)==='correct' && "border-success bg-success/15 text-success ring-2 ring-success",
              locked && guessState(g,bet,lab.optimized_time)==='wrong' && "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive")}>
            {locked&&g===lab.optimized_time&&<Check className="size-4" />}{locked&&bet===g&&g!==lab.optimized_time&&<X className="size-4" />}
            {GROWTH_LABEL[g]}
          </Button>
        ))}

      </div>

      {locked && <p className="mt-3 text-sm" role="status">{bet===lab.optimized_time?'Correct':'Not quite'} — the smart way is {GROWTH_LABEL[lab.optimized_time]}. {lab.optimized_time==='n'?'Each input item needs only a bounded amount of work.':`Its dominant work grows as ${GROWTH_LABEL[lab.optimized_time]}, not ${bet?GROWTH_LABEL[bet]:'your bet'}.`}</p>}
      </>}
      {(mode === "reveal" || (locked && mode === "full")) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <p className="text-sm font-medium">Race the approaches</p>
          <div className="flex items-center gap-4">
            <Slider value={[idx]} min={0} max={SIZES.length - 1} step={1} onValueChange={([v]) => setIdx(v ?? 0)} className="flex-1" />
            <span className="w-24 text-right font-mono text-sm">n = {formatOps(n)}</span>
          </div>
          <Lane label="Slow way" g={lab.brute_force_time} n={n} max={max} />
          <Lane label="Smart way" g={lab.optimized_time} n={n} max={max} />
          <p className="text-sm font-semibold">Slow way is {Math.round(max / Math.max(1, opsFor(lab.optimized_time, n))).toLocaleString()}× more work · Linear scale</p>
          <Lane label="Estimated memory growth" g={lab.optimized_space} n={n} max={Math.max(1,opsFor(lab.optimized_space,n))} unit="storage units" />

          <p className="pt-2 text-sm font-medium">Spot the loop: tap the line that does most of the work.</p>
          <pre className="overflow-x-auto rounded-md border bg-code py-2 text-[13px] leading-relaxed">
            {lines.map((l, k) => {
              const h = hot.get(k);
              const t = tapped.includes(k);
              return (
                <div key={k} onClick={() => tap(k)} className={cn("cursor-pointer px-4 hover:bg-accent/60", t && h && "bg-success/20", t && !h && "bg-destructive/10")}>
                  <code>{l || " "}</code>
                  {t && h && <span className="ml-3 font-sans text-xs text-success">runs {h.runs}: {h.why}</span>}
                </div>
              );
            })}
          </pre>
        </motion.div>
      )}
    </section>
  );
}
