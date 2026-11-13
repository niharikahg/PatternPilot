import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreakdownView } from "@/components/app/BreakdownView";
import { ConfidencePicker } from "@/components/app/ConfidencePicker";
import { generateBreakdown } from "@/lib/breakdown.functions";
import { LIBRARY } from "@/lib/library";
import { DIFFICULTIES, type Breakdown } from "@/lib/types";
import { addProblem } from "@/lib/local-log";
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
  const gen = useServerFn(generateBreakdown);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [b, setB] = useState<Breakdown | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [intuition, setIntuition] = useState<number | undefined>();
  const [reviewing, setReviewing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const stage = reviewing ? 2 : 0;

  const pickProblem = (title: string, problem: string) => {
    setPicked(title);
    setText(problem);
    setReviewing(false);
    requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); });
  };

  const run = useMutation({
    mutationFn: (problem: string) => gen({ data: { problem } }),
    onSuccess: (r) => {
      setB(r);
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
      return addProblem({ title: b.title, problem_text: text, pattern: b.pattern.name, difficulty, confidence, intuition, breakdown: b });
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("Saved to your problem log on this device");
      if (id) navigate({ to: "/problems/$id", params: { id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Ambient />
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold md:text-6xl">
        What are we <span className="inline-block -rotate-2 rounded-2xl bg-highlight px-3 text-highlight-foreground">cracking</span> today?
      </motion.h1>
      <p className="mt-2 text-muted-foreground">{reviewing ? "Your breakdown is ready. Start with Understand, or explore any card." : "Start with a practice problem below, or paste your own."}</p>

      <WorkspaceGuide onTryExample={() => { const example = LIBRARY.find((p) => p.title === "Two Sum"); if (example) pickProblem(example.title, example.text); }} />
      <ol aria-label="Problem progress" className="mt-5 grid grid-cols-3 border-b pb-4">
        {["Pick a problem", "Generate", "Explore & save"].map((label, i) => {
          const current = run.isPending ? 1 : stage;
          return <li key={label} aria-current={i === current ? "step" : undefined} className={cn("flex items-center gap-2 text-xs sm:text-sm", i === current ? "font-semibold text-foreground" : "text-muted-foreground")}><span className={cn("grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs", i === current && "border-primary bg-primary text-primary-foreground")}>
            {i < current ? <Check className="size-3" /> : i + 1}
          </span>{label}</li>;
        })}
      </ol>

      {reviewing && <Button variant="ghost" size="sm" className="mt-4" onClick={() => { setReviewing(false); requestAnimationFrame(() => inputRef.current?.focus()); }}><ArrowLeft className="size-4" /> Change problem</Button>}

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
          <div className="ml-auto flex items-center gap-2">
          {!run.isPending && text.trim().length >= 10 && <span aria-hidden="true" className="text-2xl motion-safe:animate-bounce">👉</span>}
          <Button className="rounded-full px-5 shadow-pop" onClick={() => run.mutate(text)} disabled={run.isPending || text.trim().length < 10}>
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {run.isPending ? "Breaking it down…" : "Generate breakdown"}
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
          <div className="surface flex flex-wrap items-center gap-4 p-4">
            <span className="text-sm font-medium">Log this problem</span>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Confidence <ConfidencePicker value={confidence} onChange={setConfidence} />
            </div>
            <Button className="ml-auto" onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="h-4 w-4" /> Save to log
            </Button>
          </div>
          <BreakdownView key={b.title + text} b={b} onIntuition={setIntuition} />
        </motion.div>
      )}
    </main>
  );
}
