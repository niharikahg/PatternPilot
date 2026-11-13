import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { GROWTH, GROWTH_LABEL, formatOps, opsFor, type Growth } from "@/lib/game";
import type { ComplexityLab as Lab } from "@/lib/types";

const SIZES = [10, 100, 1_000, 10_000, 100_000, 1_000_000];

function Lane({ label, g, n, max }: { label: string; g: Growth; n: number; max: number }) {
  const ops = opsFor(g, n);
  const pct = Math.max(2, Math.min(100, (Math.log10(ops + 1) / Math.log10(max + 1)) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label} <span className="font-mono text-muted-foreground">{GROWTH_LABEL[g]}</span></span>
        <span className="font-mono">{formatOps(ops)} ops</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <motion.div className={cn("h-full rounded-full", g === "n^2" || g === "n^3" || g === "2^n" ? "bg-destructive" : "bg-primary")} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 90, damping: 15 }} />
      </div>
    </div>
  );
}

export function ComplexityLab({ lab, code, onAnswer }: { lab: Lab; code: string; onAnswer: (correct: boolean) => void }) {
  const [bet, setBet] = useState<Growth | null>(null);
  const [locked, setLocked] = useState(false);
  const [idx, setIdx] = useState(2);
  const [tapped, setTapped] = useState<number[]>([]);
  const [hotScored, setHotScored] = useState(false);
  const n = SIZES[idx]!;
  const max = Math.max(opsFor(lab.brute_force_time, 1_000_000), 10);
  const lines = code.split("\n");
  const hot = new Map(lab.code_hotspots.map((h) => [h.line, h]));

  const lock = () => { if (!bet) return; setLocked(true); onAnswer(bet === lab.optimized_time); };
  const tap = (l: number) => {
    if (tapped.includes(l)) return;
    setTapped([...tapped, l]);
    if (!hotScored) { setHotScored(true); onAnswer(hot.has(l)); }
  };

  return (
    <section className="surface p-5">
      <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /><h3 className="text-sm font-medium">Complexity Lab</h3></div>

      <p className="mt-4 text-sm font-medium">1. Place your bet: how fast is the smart way?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {GROWTH.map((g) => (
          <motion.button key={g} whileTap={{ scale: 0.92 }} disabled={locked} onClick={() => setBet(g)}
            className={cn("rounded-md border px-3 py-2 font-mono text-sm transition-colors",
              bet === g && "border-primary bg-primary-soft",
              locked && g === lab.optimized_time && "border-success bg-success/15",
              locked && bet === g && g !== lab.optimized_time && "border-destructive bg-destructive/10")}>
            {GROWTH_LABEL[g]}
          </motion.button>
        ))}
        {!locked && <Button size="sm" disabled={!bet} onClick={lock}><Lock className="h-4 w-4" /> Lock it in</Button>}
      </div>

      {locked && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <p className="text-sm font-medium">2. Race them. Drag n and watch the slow way explode.</p>
          <div className="flex items-center gap-4">
            <Slider value={[idx]} min={0} max={SIZES.length - 1} step={1} onValueChange={([v]) => setIdx(v ?? 0)} className="flex-1" />
            <span className="w-24 text-right font-mono text-sm">n = {formatOps(n)}</span>
          </div>
          <Lane label="Slow way" g={lab.brute_force_time} n={n} max={max} />
          <Lane label="Smart way" g={lab.optimized_time} n={n} max={max} />
          <Lane label="Memory used" g={lab.optimized_space} n={n} max={max} />

          <p className="pt-2 text-sm font-medium">3. Spot the loop: tap the line that does most of the work.</p>
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
