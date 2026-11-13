import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Breakdown } from "@/lib/types";
import { stringInputs } from "@/lib/visual-inputs";

export function Visualizer({ viz, hideTechnique = false, exampleInput = "" }: { viz: Breakdown["visualization"]; hideTechnique?: boolean; exampleInput?: string }) {
  const [i, setI] = useState(0);
  const [explained, setExplained] = useState<number[]>([]);
  if (viz.kind === "none" || !viz.frames.length) return null;
  const f = viz.frames[Math.min(i, viz.frames.length - 1)];
  if (!f) return null;
  const isHi = (r: number, c: number) => f.highlight.some((h) => h.row === r && h.col === c);
  const ptrs = (r: number, c: number) => f.pointers.filter((p) => p.row === r && p.col === c).map((p) => p.name);
  const inputs = viz.kind === 'string' ? stringInputs(exampleInput) : [];
  const paired = inputs.length > 1;

  const Cell = ({ v, r, c }: { v: string; r: number; c: number }) => (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "grid h-11 min-w-11 place-items-center rounded-md border px-2 font-mono text-sm transition-all duration-200",
          (isHi(r, c) || (paired && isHi(0, c))) ? "border-primary bg-primary text-primary-foreground" : "bg-card",
        )}
      >
        {v}
      </div>
      {viz.kind !== "grid" && (
        <span className="h-4 font-mono text-[10px] text-muted-foreground">{c}</span>
      )}
      {viz.kind !== "grid" && (
        <span className="h-4 font-mono text-[11px] font-medium text-primary">{ptrs(paired ? 0 : r, c).join(",")}</span>
      )}
    </div>
  );

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Visual walkthrough</h3>
        <span className="font-mono text-xs text-muted-foreground">
          step {i + 1} / {viz.frames.length}
        </span>
      </div>
      <div className="mt-5 overflow-x-auto pb-2">
        {paired ? <div className="space-y-4">{inputs.map((input, row) => <div key={input.name} aria-label={`Input ${input.name}`} className="flex items-start gap-3"><span className="min-w-6 pt-3 font-mono text-sm font-semibold">{input.name}</span><div className="flex gap-1.5">{input.cells.length===0?<span className="text-sm text-muted-foreground">Empty string</span>:input.cells.map((v,c)=><Cell key={c} v={v} r={row} c={c} />)}</div></div>)}</div> : viz.kind === "grid" ? (
          <div className="inline-flex flex-col gap-1.5">
            {f.grid.map((row, r) => (
              <div key={r} className="flex gap-1.5">
                {row.map((v, c) => (
                  <div key={c} className="relative">
                    <Cell v={v} r={r} c={c} />
                    {ptrs(r, c).length > 0 && (
                      <span className="absolute -top-2 -right-2 rounded bg-foreground px-1 font-mono text-[10px] text-background">
                        {ptrs(r, c).join(",")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-1.5">
            {f.cells.map((v, c) => (
              <div key={c} className="flex items-start gap-1.5">
                <Cell v={v} r={0} c={c} />
                {viz.kind === "linked_list" && c < f.cells.length - 1 && (
                  <span className="mt-3 text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {explained.includes(i) && f.vars.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {f.vars.map((v) => (
            <span key={v.name} className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
              {v.name} = <span className="text-primary">{v.value}</span>
            </span>
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" className="mt-3" aria-pressed={explained.includes(i)} onClick={() => setExplained(prev => prev.includes(i) ? prev.filter(step => step !== i) : [...prev, i])}>{explained.includes(i) ? 'Hide what changed' : 'Show what changed'}</Button>
      {explained.includes(i) && <p className="mt-3 text-sm text-muted-foreground">{f.note}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" disabled={i === 0} onClick={() => setI(i - 1)}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button variant="outline" size="sm" disabled={i >= viz.frames.length - 1} onClick={() => setI(i + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
