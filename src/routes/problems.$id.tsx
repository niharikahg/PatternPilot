import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Ambient } from "@/components/fx/Ambient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BreakdownView } from "@/components/app/BreakdownView";
import { ConfidencePicker } from "@/components/app/ConfidencePicker";
import { deleteProblem, getProblem, updateProblem } from "@/lib/local-log";
import { createReviewPlan } from "@/lib/review";
import { reviewOutcome } from "@/lib/guess-feedback";
import { dayKey } from "@/lib/practice";
import { builtinAudio } from "@/lib/builtins";
import { ReviewTracker } from "@/components/app/ReviewTracker";

export const Route = createFileRoute("/problems/$id")({
  validateSearch: (search: { practice?: unknown }) => ({ practice: search["practice"] === true || search["practice"] === "true" }),
  head: () => ({
    meta: [
      { title: "Saved problem — PatternPilot" },
      { name: "description", content: "Review a saved problem breakdown." },
      { property: "og:title", content: "Saved problem — PatternPilot" },
      { property: "og:description", content: "Review a saved problem breakdown." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProblemPage,
});

function ProblemPage() {
  const { id } = Route.useParams();
  const { practice } = Route.useSearch();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: ["problems", id],
    queryFn: async () => {
      const p = getProblem(id);
      if (!p) throw new Error("Not found");
      return p;
    },
  });
  const setConf = useMutation({
    mutationFn: async (confidence: number) => updateProblem(id, { confidence }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["problems"] }); toast.success("Confidence updated"); },
  });
  const del = useMutation({
    mutationFn: async () => deleteProblem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["problems"] }); navigate({ to: "/dashboard" }); },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Ambient density={10} />
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      {q.isLoading && <div className="mt-6 h-40 animate-pulse rounded-lg bg-muted" />}
      {q.error && <p className="mt-6 text-sm text-destructive">Couldn't load this problem.</p>}
      {q.data && (
        <div className="mt-6 space-y-6">
          <BreakdownView onRestart={()=>{updateProblem(id,{code_attempt:{language:'python',code:''}});qc.invalidateQueries({queryKey:['problems']});}} initialStep="understand" sessionKey={practice?`${id}-review-${dayKey()}`:q.data.title} audioUrl={builtinAudio(q.data.title)} logControls={<>           <div className="surface flex flex-wrap items-center gap-3 p-4 text-sm">
            <span className="text-muted-foreground">· {q.data.difficulty}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => confirm("Delete this problem?") && del.mutate()}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
          <ReviewTracker status={q.data.practice_status} review={q.data.review} onChange={(status, review) => { updateProblem(id, { practice_status: status, confidence: status==='solved'?4:2, review }); qc.invalidateQueries({ queryKey: ["problems"] }); }} />
 </>} onReviewed={result=>{updateProblem(id,{practice_status:reviewOutcome(result.verdict),review:q.data?.review??createReviewPlan(),last_practiced_at:new Date().toISOString()});qc.invalidateQueries({queryKey:["problems"]});}} b={q.data.breakdown} codeAttempt={q.data.code_attempt} onCodeSave={(attempt) => updateProblem(id, { code_attempt: attempt })} onIntuition={(s) => updateProblem(id, { intuition: s })} />
        </div>
      )}
    </main>
  );
}
