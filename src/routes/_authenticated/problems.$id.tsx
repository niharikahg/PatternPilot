import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BreakdownView } from "@/components/app/BreakdownView";
import { ConfidencePicker } from "@/components/app/ConfidencePicker";
import { supabase } from "@/integrations/supabase/client";
import type { Breakdown } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/problems/$id")({
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
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: ["problems", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("problems").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const setConf = useMutation({
    mutationFn: async (confidence: number) => {
      const { error } = await supabase.from("problems").update({ confidence }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["problems"] }); toast.success("Confidence updated"); },
  });
  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("problems").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["problems"] }); navigate({ to: "/dashboard" }); },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      {q.isLoading && <div className="mt-6 h-40 animate-pulse rounded-lg bg-muted" />}
      {q.error && <p className="mt-6 text-sm text-destructive">Couldn't load this problem.</p>}
      {q.data && (
        <div className="mt-6 space-y-6">
          <div className="surface flex flex-wrap items-center gap-3 p-4 text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <ConfidencePicker value={q.data.confidence} onChange={(n) => setConf.mutate(n)} />
            <span className="text-muted-foreground">· {q.data.difficulty}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => confirm("Delete this problem?") && del.mutate()}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
          <BreakdownView b={q.data.breakdown as unknown as Breakdown} />
        </div>
      )}
    </main>
  );
}
