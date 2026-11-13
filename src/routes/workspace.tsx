import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
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

  const run = useMutation({
    mutationFn: (problem: string) => gen({ data: { problem } }),
    onSuccess: (r) => {
      setB(r);
      setIntuition(undefined);
      setDifficulty(LIBRARY.find((l) => l.title === picked)?.difficulty ?? r.difficulty);
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
      <h1 className="text-4xl font-extrabold md:text-5xl">Workspace</h1>
      <p className="mt-1 text-sm text-muted-foreground">Paste a problem, or start from the library.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LIBRARY.map((p) => (
          <button
            key={p.title}
            onClick={() => { setPicked(p.title); setText(p.text); }}
            className={cn("rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent", picked === p.title && "border-primary bg-primary-soft text-foreground")}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="surface mt-4 p-4">
        <Textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setPicked(null); }}
          placeholder="Paste a coding interview problem here…"
          className="min-h-36 resize-y border-0 p-0 shadow-none focus-visible:ring-0"
        />
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">{text.length} characters</span>
          <Button onClick={() => run.mutate(text)} disabled={run.isPending || text.trim().length < 10}>
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {run.isPending ? "Breaking it down…" : "Generate breakdown"}
          </Button>
        </div>
      </div>

      {run.isPending && (
        <div className="mt-10 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
        </div>
      )}

      {b && !run.isPending && (
        <div className="mt-10 space-y-6">
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
          <BreakdownView b={b} onIntuition={setIntuition} />
        </div>
      )}
    </main>
  );
}
