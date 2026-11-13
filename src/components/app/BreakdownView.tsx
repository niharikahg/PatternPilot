import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, X, Bug, Code2, Copy, Gauge, Layers, ListChecks, Workflow, Play, FlaskConical, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PATTERNS, type Breakdown } from "@/lib/types";
import { breakdownToMarkdown } from "@/lib/markdown";
import { patternVerdict, reviewOutcome } from "@/lib/guess-feedback";
import { guessState } from "@/lib/guess-state";
import type { CodeFeedback } from "@/lib/code-review.functions";
import { BugPractice } from "./BugPractice";
import { Visualizer } from "./Visualizer";
import { StoryMode } from "./StoryMode";
import { ComplexityLab } from "./ComplexityLab";
import { celebrate } from "@/lib/confetti";
import { intuitionScore, nextCombo } from "@/lib/game";
import { AnimatePresence, motion } from "framer-motion";
import { CodePractice } from "./CodePractice";
import type { SavedProblem } from "@/lib/local-log";
import { storyWithEnding } from "@/lib/story-ending";
import { award, earlyReveal, freshSession, recordPracticeDay, type PracticeSession } from "@/lib/practice";
import type { Growth } from "@/lib/game";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Lang = keyof Breakdown["solution"];
const STEPS = ["Understand", "Examples", "Pattern", "Approach", "Solution", "Complexity"] as const;
const ICONS = [BookOpen, ListChecks, Layers, Workflow, Code2, Gauge];

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

export function BreakdownView({ b, actions, onIntuition, codeAttempt, onCodeSave, logControls, initialStep = "understand", sessionKey = b.title, audioUrl, onReviewed }: { b: Breakdown; actions?: ReactNode; onIntuition?: (score: number) => void; codeAttempt?: SavedProblem["code_attempt"]; onCodeSave?: (attempt: NonNullable<SavedProblem["code_attempt"]>) => void; logControls?: ReactNode; initialStep?: string; sessionKey?: string; audioUrl?: string | undefined; onReviewed?: (feedback: CodeFeedback) => void }) {
  const [session, setSession] = useState<PracticeSession>(() => freshSession(initialStep));
  const [ready, setReady] = useState(false);
  const [burst, setBurst] = useState(false);
  const unlocked = session.submitted || session.early;
  const playbackStory = useMemo(() => audioUrl && !audioUrl.startsWith('blob:') ? b.story : storyWithEnding(b), [b,audioUrl]);
  useEffect(() => { try { const value = localStorage.getItem(`pp-flow-${sessionKey}`); if(value) setSession(JSON.parse(value)); } catch {} setReady(true); }, [sessionKey]);
  useEffect(() => { if(ready) try { localStorage.setItem(`pp-flow-${sessionKey}`, JSON.stringify(session)); } catch {} }, [session, ready, sessionKey]);
  useEffect(() => { if(!burst) return; const t=setTimeout(()=>setBurst(false),2000); return ()=>clearTimeout(t); }, [burst,session.attempts]);
  const navigationRef = useRef<HTMLDivElement>(null);
  const views = [
    { id: "understand", label: "Understand", icon: BookOpen },
    { id: "guess", label: "Guess", icon: FlaskConical },
    { id: "walkthrough", label: "Walkthrough", icon: Play },
    { id: "code", label: "Your code", icon: Code2 },
    { id: "bug", label: "Spot the bug", icon: Bug },
    { id: "reveal", label: "Reveal", icon: Layers },
    { id: "log", label: "Log it", icon: Check },
  ];
  const activeIndex = views.findIndex((view) => view.id === session.step);
  const guessed = Boolean(session.patternGuess && session.complexityGuess);
  const switchView = (value: string) => { if(["walkthrough","code","bug","reveal","log"].includes(value) && !guessed) return; setSession(prev=>({...prev,step:value})); navigationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const answer = (correct: boolean) => { setSession(prev=>({...prev, correct:prev.correct+(correct?1:0), attempts:prev.attempts+1, combo:correct?prev.combo+1:0})); setBurst(true); if(correct) celebrate(1); };
  const prediction = (key:string, value:string, correct:boolean) => { setSession(prev=>({...award(prev,key,correct), ...(key==='pattern'?{patternGuess:value}:{complexityGuess:value})})); setBurst(true); recordPracticeDay(); };
  const revealEarly = () => { if(!window.confirm("Are you sure? Revealing now lowers your intuition score and code XP.")) return; setSession(prev=>earlyReveal(prev)); setBurst(true); };
  useEffect(()=>{onIntuition?.(intuitionScore(session.correct,session.attempts));},[session.correct,session.attempts]);
  const patternOptions = useMemo(()=>{const alternatives=PATTERNS.filter(p=>p!==b.pattern.name).slice(0,3); return [...alternatives,b.pattern.name].sort((a,c)=>a.localeCompare(c));},[b.pattern.name]);
  const [lang, setLang] = useState<Lang>("python");
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState<number | null>(null);
  const previews = [b.understand.restatement, `${b.examples.length} test cases`, b.pattern.name, b.approach.optimized, "Python · Java · JavaScript", `Time ${b.complexity.time} · Space ${b.complexity.space}`];

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
        <Badge variant={burst ? "secondary" : "outline"} aria-live="polite">{burst ? "🔥 " : ""}{session.xp} XP · intuition {intuitionScore(session.correct,session.attempts)}% · {session.combo}×</Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={!unlocked} onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy notes
          </Button>
          {session.step==='log'&&actions}
        </div>
      </div>

      <Tabs value={session.step} onValueChange={switchView}>
        <div ref={navigationRef} className="sticky top-16 z-20 scroll-mt-16 border-y bg-background py-3">
          <TabsList aria-label="Problem activities" className="grid h-auto w-full grid-cols-4 gap-1 bg-transparent p-0 lg:grid-cols-7">
            {views.map(({ id, label, icon: Icon }, index) => <TabsTrigger key={id} value={id} disabled={index>1&&!guessed} className="flex min-h-12 flex-col gap-1 px-1 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:flex-row sm:gap-2 sm:text-sm"><Icon className="size-4 shrink-0" /><span>{index + 1}. {label}</span></TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value="understand" className="space-y-5 pt-4"><h3 className="font-display text-xl font-bold">Understand the problem</h3>{body[0]}<h3 className="font-display text-xl font-bold">Examples</h3>{body[1]}</TabsContent>
        <TabsContent value="guess" className="space-y-5 pt-4"><h3 className="font-display text-xl font-bold">Which pattern fits?</h3><div className="grid gap-2 sm:grid-cols-2">{patternOptions.map(option=>{const state=guessState(option,session.patternGuess,b.pattern.name);return <Button key={option} variant="outline" aria-pressed={session.patternGuess===option} className={cn('h-auto min-h-12 whitespace-normal disabled:opacity-100',state==='correct'&&'border-success bg-success/15 text-success ring-2 ring-success',state==='wrong'&&'border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive')} disabled={Boolean(session.patternGuess)} onClick={()=>prediction('pattern',option,option===b.pattern.name)}>{state==='correct'&&<Check className="size-4" />}{state==='wrong'&&<X className="size-4" />}{option}</Button>;})}</div>{session.patternGuess&&<p role="status" className={cn('text-sm',session.patternGuess===b.pattern.name?'text-success':'text-destructive')}>{patternVerdict(b,session.patternGuess)}</p>}{b.complexity_lab&&<ComplexityLab mode="guess" lab={b.complexity_lab} code="" initialBet={session.complexityGuess as Growth | undefined} onBet={value=>prediction('complexity',value,value===b.complexity_lab?.optimized_time)} onAnswer={()=>{}} />}</TabsContent>
        <TabsContent forceMount value="walkthrough" className="space-y-5 pt-4 data-[state=inactive]:hidden"><Visualizer viz={b.visualization} hideTechnique={!unlocked} />{playbackStory&&<StoryMode story={playbackStory} onAnswer={answer} allowEnding={unlocked} audioUrl={audioUrl} />}</TabsContent>
        <TabsContent forceMount value="code" className="pt-4 data-[state=inactive]:hidden"><CodePractice problem={`${b.title}\n${b.understand.restatement}\n${b.understand.constraints.join('; ')}`} attempt={codeAttempt} onSave={onCodeSave??(()=>{})} onSubmitted={()=>setSession(prev=>({...prev,submitted:true}))} onReviewed={result=>{ onReviewed?.(result); if(result.verdict==='Looks correct') {setSession(prev=>award(prev,'code',true)); setBurst(true);recordPracticeDay();} }} /><Button variant="ghost" className="mt-3" disabled={unlocked} onClick={revealEarly}><Lock className="size-4" /> I'm stuck, reveal</Button></TabsContent>
        <TabsContent forceMount value="bug" className="pt-4 data-[state=inactive]:hidden"><BugPractice problem={b.understand.restatement} title={b.title} sessionKey={sessionKey} /></TabsContent>
        <TabsContent value="reveal" className="space-y-5 pt-4">
        {!unlocked&&<div className="flex flex-wrap items-center gap-3"><Lock className="size-5" /><p className="text-sm">Submit your code for review to unlock the answers.</p><Button variant="outline" onClick={revealEarly}>I'm stuck, reveal</Button></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((label, i) => {
          if(i<2) return null;
          const Icon = ICONS[i] ?? BookOpen;
          return (
            <Button key={label} variant="outline" aria-label={`Open ${label}`} disabled={!unlocked} onClick={() => { if(unlocked) setOpened(i); }} className={cn("group h-52 min-w-0 flex-col items-stretch justify-between whitespace-normal rounded-lg p-5 text-left transition-transform motion-safe:hover:-translate-y-1", i === 0 && "border-highlight bg-highlight text-highlight-foreground hover:bg-highlight/90", i === 4 && "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background")}>
              <span className="flex items-center justify-between"><Icon className="size-5" /><span className="font-mono text-xs opacity-60">0{i + 1}</span></span>
              <span><span className="block font-display text-xl font-bold">{label}</span><span className={cn("mt-2 line-clamp-2 text-sm font-normal leading-relaxed opacity-75",!unlocked&&"blur-sm")} >{unlocked?previews[i]:"Try your idea before uncovering the answer"}</span></span>
              {unlocked?<ArrowUpRight className="ml-auto size-4" />:<Lock className="ml-auto size-5" />}
            </Button>
          );
        })}
      </div>
      <Dialog open={opened !== null} onOpenChange={(open) => { if (!open) setOpened(null); }}>
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-lg">
          <DialogHeader className="pr-6">
            <DialogTitle className="font-display text-2xl">{opened === null ? "" : STEPS[opened]}</DialogTitle>
            <DialogDescription>{b.title}</DialogDescription>
          </DialogHeader>
          <div className="min-w-0">{opened === null ? null : body[opened]}</div>
        </DialogContent>
      </Dialog>
      {unlocked&&b.complexity_lab&&<ComplexityLab mode="reveal" lab={b.complexity_lab} code={b.solution.python} onAnswer={answer} />}
      </TabsContent>
      <TabsContent value="log" className="pt-4">{logControls ?? actions}</TabsContent>
      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
        <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => { const previous = views[activeIndex - 1]; if (previous) switchView(previous.id); }}><ArrowLeft className="size-4" /> Back</Button>
        <span className="text-xs text-muted-foreground">{activeIndex + 1} of {views.length}</span>
        <Button size="sm" disabled={activeIndex === views.length - 1 || (session.step==='guess'&&!guessed)} onClick={() => { const next = views[activeIndex + 1]; if (next) switchView(next.id); }}>Next: {views[activeIndex + 1]?.label ?? "Done"}<ArrowRight className="size-4" /></Button>
      </div>
      </Tabs>

    </div>
  );
}
