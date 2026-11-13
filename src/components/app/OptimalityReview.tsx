import { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { optimalityScore, type Optimality } from '@/lib/optimality';
export function OptimalityReview({ assessment, verdict, revealTargets, onRetry }: { assessment: Optimality; verdict: string; revealTargets: boolean; onRetry: () => void }) {
  const [shown, setShown] = useState(0);
  const score = optimalityScore(verdict, assessment);
  return <section aria-label="Solution optimality" className="space-y-4 border-y py-5">
    <div className="flex flex-wrap items-baseline justify-between gap-3"><h4 className="font-display text-lg font-bold">Distance to optimal</h4><span className="font-mono text-2xl font-semibold">{score ? `${score.total}/100` : 'Not enough evidence'}</span></div>
    <p className="text-xs text-muted-foreground">AI-estimated rubric, not a runtime percentile. Higher is closer to a correct, efficient solution.</p>
    {score && <div className="grid grid-cols-3 gap-2 text-sm"><div>Correctness<span className="block font-mono">{score.correctness}/50</span></div><div>Time efficiency<span className="block font-mono">{score.time}/35</span></div><div>Space efficiency<span className="block font-mono">{score.space}/15</span></div></div>}
    {verdict !== 'Looks correct' && <p className="text-sm text-muted-foreground">Resolve correctness first; efficient code can still return the wrong answer.</p>}
    {revealTargets && <><div className="grid gap-2 font-mono text-sm sm:grid-cols-2"><p>Optimal time: {assessment.optimal_time}</p><p>Optimal space: {assessment.optimal_space}</p></div><p className="text-sm">{assessment.rationale}</p></>}
    <h4 className="font-semibold">Think toward a better solution</h4>
    <ol className="space-y-3">{assessment.steps.slice(0, shown).map((step, index) => <li key={index} className="border-l-2 border-primary pl-3"><p className="text-sm font-semibold">{index + 1}. {step.question}</p><p className="mt-1 text-sm text-muted-foreground">{step.action}</p></li>)}</ol>
    <div className="flex flex-wrap gap-2">{shown < assessment.steps.length && <Button variant="outline" size="sm" onClick={() => setShown(n => n + 1)}>{shown ? 'Next improvement step' : 'Give me a thinking step'}<ArrowRight className="size-4" /></Button>}{shown > 0 && <Button variant="ghost" size="sm" onClick={() => setShown(0)}>Hide steps</Button>}<Button size="sm" onClick={onRetry}><RotateCcw className="size-4" /> Improve and re-review</Button></div>
  </section>;
}