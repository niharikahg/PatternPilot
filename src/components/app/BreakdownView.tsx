import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Breakdown } from "@/lib/types";
import { breakdownToMarkdown } from "@/lib/markdown";
import { Visualizer } from "./Visualizer";
import { StoryMode } from "./StoryMode";
import { ComplexityLab } from "./ComplexityLab";
import { celebrate } from "@/lib/confetti";
import { intuitionScore, nextCombo } from "@/lib/game";
import { AnimatePresence, motion } from "framer-motion";

type Lang = keyof Breakdown["solution"];
const STEPS = ["Understand", "Examples", "Pattern", "Approach", "Solution", "Complexity"] as const;

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-code p-4 text-[13px] leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function H({ children }: { children: ReactNode }) {
  return <h4 className="mt-5 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground first:mt-0">{children}</h4>;
}

export function BreakdownView({ b, actions, onIntuition }: { b: Breakdown; actions?: ReactNode; onIntuition?: (score: number) => void }) {
  const [combo, setCombo] = useState(0);
  const [tally, setTally] = useState({ correct: 0, attempts: 0 });
  const answer = (correct: boolean) => {
    const c = nextCombo(combo, correct);
    setCombo(c);
    const t = { correct: tally.correct + (correct ? 1 : 0), attempts: tally.attempts + 1 };
    setTally(t);
    onIntuition?.(intuitionScore(t.correct, t.attempts));
    if (correct) {
      celebrate(c);
      if (c >= 2) toast.success(`${c}x combo!`);
    } else toast("Not quite. Combo reset, try the next one!");
  };
  const [lang, setLang] = useState<Lang>("python");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(breakdownToMarkdown(b, lang));
    setCopied(true);
    toast.success("Notes copied as markdown");
    setTimeout(() => setCopied(false), 1500);
  };

  const body = [
    <div key="u">
      <p className="leading-relaxed">{b.understand.restatement}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-muted p-3 text-sm"><span className="font-medium">Input:</span> {b.understand.inputs}</div>
        <div className="rounded-md bg-muted p-3 text-sm"><span className="font-medium">Output:</span> {b.understand.outputs}</div>
      </div>
      <H>Constraints</H>
      <ul className="list-disc space-y-1 pl-5 text-sm">{b.understand.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
      <H>Ask the interviewer</H>
      <ul className="space-y-2 text-sm">
        {b.understand.clarifying_questions.map((q) => (
          <li key={q} className="rounded-md border-l-2 border-primary bg-primary-soft px-3 py-2">{q}</li>
        ))}
      </ul>
    </div>,
    <div key="e" className="space-y-3">
      {b.examples.map((e, i) => (
        <div key={i} className="rounded-md border p-4">
          <div className="grid gap-2 font-mono text-[13px] sm:grid-cols-2">
            <div><span className="text-muted-foreground">in: </span>{e.input}</div>
            <div><span className="text-muted-foreground">out: </span>{e.output}</div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{e.explanation}</p>
        </div>
      ))}
    </div>,
    <div key="p">
      <Badge className="text-sm">{b.pattern.name}</Badge>
      <H>Why it fits</H>
      <p className="text-sm leading-relaxed">{b.pattern.why}</p>
      <H>How to recognize it next time</H>
      <p className="rounded-md bg-primary-soft p-3 text-sm leading-relaxed">{b.pattern.recognize}</p>
    </div>,
    <div key="a">
      <H>Brute force</H>
      <p className="mb-2 text-sm">{b.approach.brute_force}</p>
      <Code>{b.approach.brute_force_pseudocode}</Code>
      <H>Optimized</H>
      <p className="mb-2 text-sm">{b.approach.optimized}</p>
      <Code>{b.approach.optimized_pseudocode}</Code>
    </div>,
    <div key="s">
      <div className="mb-3 inline-flex rounded-md border p-0.5">
        {(["python", "java", "javascript"] as Lang[]).map((l) => (
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={lang === l}
            key={l}
            onClick={() => setLang(l)}
            className={cn("rounded px-3 py-1 text-sm capitalize transition-colors", lang === l ? "bg-accent font-medium" : "text-muted-foreground")}
          >
            {l === "javascript" ? "JavaScript" : l}
          </Button>
        ))}
      </div>
      <Code>{b.solution[lang]}</Code>
    </div>,
    <div key="c">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Time</div><div className="font-mono text-lg">{b.complexity.time}</div></div>
        <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Space</div><div className="font-mono text-lg">{b.complexity.space}</div></div>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{b.complexity.explanation}</p>
      <H>Likely follow-ups</H>
      <ul className="list-disc space-y-1 pl-5 text-sm">{b.complexity.follow_ups.map((f) => <li key={f}>{f}</li>)}</ul>
    </div>,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{b.title}</h2>
        <Badge variant="secondary">{b.difficulty}</Badge>
        <Badge variant="outline">{b.pattern.name}</Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          {b.story && b.story.scenes.length > 0 && <StoryMode story={b.story} onAnswer={answer} />}
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy notes
          </Button>
          {actions}
        </div>
      </div>

      <nav aria-label="Breakdown sections" className="flex flex-wrap gap-2 border-y py-3">
        {STEPS.map((label, i) => (
          <Button key={label} asChild variant="ghost" size="sm">
            <a href={`#breakdown-${i}`}><span className="font-mono text-xs text-primary">0{i + 1}</span>{label}</a>
          </Button>
        ))}
      </nav>
      <div className="grid items-start gap-x-8 gap-y-6 md:grid-cols-2">
        {STEPS.map((label, i) => (
          <section key={label} id={`breakdown-${i}`} aria-label={label} className="min-w-0 scroll-mt-24 border-t-2 border-primary/30 pt-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-highlight font-mono text-sm font-semibold text-highlight-foreground">0{i + 1}</span>
              <h3 className="text-lg font-semibold">{label}</h3>
            </div>
            {body[i]}
          </section>
        ))}
      </div>

      {b.complexity_lab && <ComplexityLab lab={b.complexity_lab} code={b.solution.python} onAnswer={answer} />}
      <Visualizer viz={b.visualization} />
      <AnimatePresence>
        {combo > 0 && (
          <motion.div key={combo} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed bottom-5 right-5 z-50 rounded-full bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground shadow-lg">
            🔥 {combo}x combo · intuition {intuitionScore(tally.correct, tally.attempts)}%
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
