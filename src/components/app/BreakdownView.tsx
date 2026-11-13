import { useState, type ReactNode } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Breakdown } from "@/lib/types";
import { breakdownToMarkdown } from "@/lib/markdown";
import { Visualizer } from "./Visualizer";

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

export function BreakdownView({ b, actions }: { b: Breakdown; actions?: ReactNode }) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [thinkFirst, setThinkFirst] = useState(true);
  const [lang, setLang] = useState<Lang>("python");
  const [copied, setCopied] = useState(false);
  const shown = !thinkFirst || revealed[step];

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
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn("rounded px-3 py-1 text-sm capitalize transition-colors", lang === l ? "bg-accent font-medium" : "text-muted-foreground")}
          >
            {l === "javascript" ? "JavaScript" : l}
          </button>
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
          <Button variant="outline" size="sm" onClick={() => setThinkFirst(!thinkFirst)}>
            {thinkFirst ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Think first: {thinkFirst ? "on" : "off"}
          </Button>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy notes
          </Button>
          {actions}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <ol className="flex gap-1 overflow-x-auto md:flex-col">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex w-full items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors",
                  step === i ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/60",
                )}
              >
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-xs", step === i && "border-primary bg-primary text-primary-foreground", i < step && "border-primary text-primary")}>
                  {i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="surface min-h-64 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">{STEPS[step]}</h3>
            <span className="font-mono text-xs text-muted-foreground">{step + 1}/6</span>
          </div>
          {shown ? (
            <div className="animate-in fade-in duration-300">{body[step]}</div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-14 text-center">
              <p className="text-sm text-muted-foreground">Take a minute to work through this step yourself.</p>
              <Button className="mt-4" size="sm" onClick={() => setRevealed({ ...revealed, [step]: true })}>
                <Eye className="h-4 w-4" /> Reveal {STEPS[step]?.toLowerCase()}
              </Button>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t pt-4">
            <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            <Button variant="ghost" size="sm" disabled={step === 5} onClick={() => setStep(step + 1)}>Next step</Button>
          </div>
        </div>
      </div>

      <Visualizer viz={b.visualization} />
    </div>
  );
}
