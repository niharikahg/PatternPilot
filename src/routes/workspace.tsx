import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreakdownView } from "@/components/app/BreakdownView";
import { ConfidencePicker } from "@/components/app/ConfidencePicker";
import { cachedBreakdown, cacheBreakdown } from "@/lib/breakdown-cache";
import { builtinBreakdown, builtinAudio } from "@/lib/builtins";
import { prepareNarration } from "@/lib/narration-cache";
import { storyWithEnding } from "@/lib/story-ending";
import { LIBRARY } from "@/lib/library";
import { DIFFICULTIES, type Breakdown } from "@/lib/types";
import { addProblem, type SavedProblem } from "@/lib/local-log";
import { createReviewPlan } from "@/lib/review";
import { reviewOutcome } from "@/lib/guess-feedback";
import { ReviewTracker } from "@/components/app/ReviewTracker";
import type { PracticeStatus, ReviewPlan } from "@/lib/review";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Ambient } from "@/components/fx/Ambient";
import { ThinkingScene } from "@/components/fx/ThinkingScene";
import { WorkspaceGuide } from "@/components/app/WorkspaceGuide";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — PatternPilot" },
      { name: "description", content: "Paste a coding problem and get a structured 6-step interview breakdown." },
      { property: "og:title", content: "Workspace — PatternPilot" },
      { property: "og:description", content: "Break down coding interview problems step by step." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Workspace,
});

function Workspace() {

  const [earlySections,setEarlySections] = useState<Partial<Breakdown>>({});
  const [audioUrl,setAudioUrl] = useState<string | undefined>();
  const [restored,setRestored] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [b, setB] = useState<Breakdown | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [intuition, setIntuition] = useState<number | undefined>();
  const [reviewing, setReviewing] = useState(false);
  const [practiceStatus, setPracticeStatus] = useState<PracticeStatus>("untried");
  const [reviewPlan, setReviewPlan] = useState<ReviewPlan | undefined>();
  const [codeAttempt, setCodeAttempt] = useState<SavedProblem["code_attempt"]>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const stage = reviewing ? 2 : 0;

  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('pp-workspace')??'null');if(saved){setText(saved.text??'');setPicked(saved.picked??null);setB(saved.b??null);setReviewing(Boolean(saved.b));setCodeAttempt(saved.codeAttempt);setConfidence(saved.confidence??3);setDifficulty(saved.difficulty??'Medium');setPracticeStatus(saved.practiceStatus??'untried');setReviewPlan(saved.reviewPlan);if(saved.b)prepareAudio(saved.b);}}catch{}setRestored(true);},[]);
  useEffect(()=>{if(restored)try{localStorage.setItem('pp-workspace',JSON.stringify({text,picked,b:reviewing?b:null,codeAttempt,confidence,difficulty,practiceStatus,reviewPlan}));}catch{}},[restored,text,picked,b,reviewing,codeAttempt,confidence,difficulty,practiceStatus,reviewPlan]);

  const pickProblem = (title: string, problem: string) => {
    setPicked(title);
    setText(problem);
    setReviewing(false);
    requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); });
  };

  const prepareAudio = (value: Breakdown) => {
    const built=builtinAudio(value.title); if(built){setAudioUrl(built);return;}
    const story=storyWithEnding(value); if(!story)return;
    void prepareNarration(story.scenes.map(s=>s.caption)).then(setAudioUrl).catch(()=>{});
  };
  const run = useMutation({
    mutationFn: async (problem: string) => {
      setAudioUrl(undefined); setEarlySections({});
      const cached=builtinBreakdown(problem)??cachedBreakdown(problem);
      if(cached){prepareAudio(cached);return cached;}
      const response=await fetch('/api/public/breakdown',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({problem})});
      if(!response.ok||!response.body)throw new Error('Could not start this problem. Please try again.');
      const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';let result:Breakdown|null=null;let partial:Partial<Breakdown>={};let started=false;
      while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let end:number;while((end=buffer.indexOf('\n'))>=0){const message=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);if(message.error)throw new Error(message.error);if(message.section){partial={...partial,[message.section]:message.value};setEarlySections(partial);if(partial.story&&partial.approach&&partial.pattern&&partial.complexity&&!started){started=true;prepareAudio(partial as Breakdown);}}if(message.complete)result=message.complete;}}
      if(!result)throw new Error('The answer was interrupted. Your input is saved.');cacheBreakdown(problem,result);if(!started)prepareAudio(result);return result;
    },
    onSuccess: (r) => {
      setB(r);
      setPracticeStatus("untried"); setReviewPlan(undefined); setCodeAttempt(undefined);
      setReviewing(true);
      setIntuition(undefined);
      setDifficulty(LIBRARY.find((l) => l.title === picked)?.difficulty ?? r.difficulty);
      requestAnimationFrame(() => { resultRef.current?.focus(); resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!b) return;
      return addProblem({ title: b.title, problem_text: text, pattern: b.pattern.name, difficulty, confidence, intuition, breakdown: b, practice_status: practiceStatus, review: reviewPlan, last_practiced_at: new Date().toISOString(), ...(codeAttempt ? { code_attempt: codeAttempt } : {}) });
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Saved to your problem log on this device");
      if (id) navigate({ to: "/problems/$id", params: { id }, search:{practice:false} });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Ambient />
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold md:text-6xl">
        What are we <span className="inline-block -rotate-2 rounded-2xl bg-highlight px-3 text-highlight-foreground">cracking</span> today?
      </motion.h1>
      <p className="mt-2 text-muted-foreground">{reviewing ? "Your breakdown is ready. Start with Understand, then try your guesses before revealing answers." : "Start with a practice problem below, or paste your own."}</p>

      <WorkspaceGuide onTryExample={() => { const example = LIBRARY.find((p) => p.title === "Two Sum"); if (example) pickProblem(example.title, example.text); }} />
      <ol aria-label="Problem progress" className="mt-5 grid grid-cols-3 border-b pb-4">
        {["Pick a problem", "Find the approach", "Explore & save"].map((label, i) => {
          const current = run.isPending ? 1 : stage;
          return <li key={label} aria-current={i === current ? "step" : undefined} className={cn("flex items-center gap-2 text-xs sm:text-sm", i === current ? "font-semibold text-foreground" : "text-muted-foreground")}><span className={cn("grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs", i === current && "border-primary bg-primary text-primary-foreground")}>
            {i < current ? <Check className="size-3" /> : i + 1}
          </span>{label}</li>;
        })}
      </ol>

      {reviewing && <Button variant="ghost" size="sm" className="mt-4" onClick={() => { setReviewing(false); requestAnimationFrame(() => inputRef.current?.focus()); }}><ArrowLeft className="size-4" /> Change problem</Button>}

      {run.isPending&&earlySections.understand&&<section className="mt-6 space-y-4 border-y py-5" aria-label="Early problem understanding"><h2 className="font-display text-xl font-bold">1. Understand</h2><p>{earlySections.understand.restatement}</p><p className="text-sm">Input: {earlySections.understand.inputs} · Output: {earlySections.understand.outputs}</p>{earlySections.examples&&<><h3 className="font-semibold">Examples</h3>{earlySections.examples.map((e,i)=><div key={i} className="border-b py-3"><p className="font-mono text-sm">{e.input} → {e.output}</p><p className="text-sm">{e.explanation}</p></div>)}</>}<p className="text-sm text-muted-foreground">Walkthrough, code practice, and answers are loading in the background…</p></section>}
      {!reviewing && <>
      <h2 className="mt-6 text-lg font-semibold">1. Choose your starting point</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {LIBRARY.map((p, i) => (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05, type: "spring" }} whileHover={{ y: -3, rotate: i % 2 ? 2 : -2 }} whileTap={{ scale: 0.92 }}
            key={p.title}
          >
            <Button variant="outline" size="sm" disabled={run.isPending} onClick={() => pickProblem(p.title, p.text)} className={cn("rounded-full", picked === p.title && "border-transparent bg-foreground text-background hover:bg-foreground hover:text-background")}>
            {p.title}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className={cn("mt-5 grid items-start gap-6", run.isPending && "lg:grid-cols-2")} >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface min-w-0 p-5 transition-shadow focus-within:shadow-pop">
        <label htmlFor="problem-text" className="mb-3 block text-sm font-semibold">Your problem</label>
        <Textarea
          id="problem-text"
          ref={inputRef}
          disabled={run.isPending}
          value={text}
          onChange={(e) => { setText(e.target.value); setPicked(null); }}
          placeholder="Paste a coding interview problem here…"
          className="min-h-36 resize-y border-0 p-0 shadow-none focus-visible:ring-0"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <span className="text-xs text-muted-foreground">{text.trim().length < 10 ? "Choose a problem above or paste a complete question." : "Ready for your six-step breakdown"}</span>
          <div className="relative ml-auto flex items-center py-3 pl-12">
          {!run.isPending && text.trim().length >= 10 && <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 text-6xl leading-none motion-safe:animate-bounce">👉</span>}
          <Button className="rounded-full px-5 shadow-pop" onClick={() => run.mutate(text)} disabled={run.isPending || text.trim().length < 10}>
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {run.isPending ? "Finding your approach…" : "Show me the approach"}
          </Button>
          </div>
        </div>
      </motion.div>

      {run.isPending && <ThinkingScene />}
      </div>
      </>}

      {b && reviewing && !run.isPending && (
        <motion.div ref={resultRef} tabIndex={-1} initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 80 }} className="mt-6 scroll-mt-20 space-y-6 outline-none">
          <h2 className="text-lg font-semibold">3. Explore your breakdown</h2>
          <BreakdownView key={b.title + text} b={b} onIntuition={setIntuition} codeAttempt={codeAttempt} onCodeSave={setCodeAttempt} audioUrl={audioUrl} onReviewed={result=>{setPracticeStatus(reviewOutcome(result.verdict));setReviewPlan(createReviewPlan());}} logControls={<>           <div className="surface flex flex-wrap items-center gap-4 p-4">
            <span className="text-sm font-medium">Log this problem</span>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <ReviewTracker status={practiceStatus} review={reviewPlan} onChange={(status, plan) => { setPracticeStatus(status); setConfidence(status==='solved'?4:2);setReviewPlan(plan); }} />
          <Button className="mt-4" onClick={() => save.mutate()} disabled={save.isPending || practiceStatus==='untried'}><Save className="size-4" /> Save this outcome</Button>
 </>} />
        </motion.div>
      )}
    </main>
  );
}
