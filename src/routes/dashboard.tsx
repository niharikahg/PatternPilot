import { createFileRoute, Link } from "@tanstack/react-router";
import { Ambient } from "@/components/fx/Ambient";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listProblems } from "@/lib/local-log";
import { patternBreakdown, weakestPatterns } from "@/lib/stats";
import { useEffect, useState } from "react";
import { dailyStreak, todaysReview } from "@/lib/practice";
import { isReviewDue, nextReview } from "@/lib/review";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PatternPilot" },
      { name: "description", content: "Track problems solved, pattern coverage and your weakest patterns." },
      { property: "og:title", content: "Dashboard — PatternPilot" },
      { property: "og:description", content: "Your coding interview prep progress at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const q = useQuery({
    queryKey: ["problems", "list"],
    queryFn: async () => listProblems(),
  });
  const [streak,setStreak]=useState(0);
  useEffect(()=>{try{setStreak(dailyStreak(JSON.parse(localStorage.getItem("pp-practice-days")??"[]")));}catch{}},[]);
  const rows = q.data ?? [];
  const today=todaysReview(rows);
  const byPattern = patternBreakdown(rows);
  const weak = weakestPatterns(rows);
  const avg = rows.length ? rows.reduce((s, r) => s + r.confidence, 0) / rows.length : 0;
  const max = Math.max(1, ...byPattern.map((p) => p.count));
  const reviews = rows.filter((row) => nextReview(row.review)).sort((a, b) => String(nextReview(a.review)).localeCompare(String(nextReview(b.review))));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Ambient density={10} />
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold md:text-5xl">Your pattern map</h1>
        <Button asChild size="sm"><Link to="/workspace"><Plus className="h-4 w-4" /> New problem</Link></Button>
      </div>

      {q.isLoading ? (
        <div className="mt-6 h-40 animate-pulse rounded-lg bg-muted" />
      ) : rows.length === 0 ? (
        <div className="surface mt-6 flex flex-col items-center p-12 text-center">
          <p className="font-medium">No problems logged yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Break down your first problem and save it to start tracking patterns.</p>
          <Button asChild className="mt-4"><Link to="/workspace">Open workspace</Link></Button>
        </div>
      ) : (
        <>
          <section className="mt-6 flex flex-wrap items-center gap-5 border-y py-5" aria-label="Today’s review"><div><p className="font-mono text-sm">🔥 {streak} day streak</p><h2 className="font-display text-xl font-bold">Today’s review</h2><p className="mt-2">{today?.title ?? "Save a problem to begin"}</p></div>{today&&<Button asChild className="ml-auto"><Link to="/problems/$id" params={{id:today.id}} search={{practice:true}}>Try again with answers locked <ArrowRight className="size-4" /></Link></Button>}</section>
          <section className="mt-6 border-y py-5" aria-label="Review reminders">
            <h2 className="font-display text-xl font-bold">Your review reminders</h2>
            <p className="mt-1 text-sm text-muted-foreground">{rows.filter((row) => row.practice_status === "solved").length} solvable · {rows.filter((row) => row.practice_status === "retry").length} to practice again · Reminders appear here on this device.</p>
            {reviews.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No reviews scheduled.</p> : <ul className="mt-3 divide-y">{reviews.map((row) => <li key={row.id}><Link to="/problems/$id" params={{ id: row.id }} search={{practice:true}} className="flex flex-wrap items-center gap-3 py-3"><span className="font-medium">{row.title}</span><Badge variant={isReviewDue(row.review) ? "default" : "outline"}>{isReviewDue(row.review) ? "Review due" : `Review ${new Date(nextReview(row.review) ?? "").toLocaleDateString()}`}</Badge><ArrowRight className="ml-auto size-4" /></Link></li>)}</ul>}
          </section>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Problems logged" value={String(rows.length)} />
            <Stat label="Patterns practiced" value={String(byPattern.length)} />
            <Stat label="Avg. confidence" value={`${avg.toFixed(1)} / 5`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="surface p-5">
              <h2 className="text-sm font-medium">By pattern</h2>
              <div className="mt-4 space-y-3">
                {byPattern.map((p) => (
                  <div key={p.pattern} className="grid grid-cols-[130px_1fr_70px] items-center gap-3 text-sm">
                    <span className="truncate">{p.pattern}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(p.count / max) * 100}%` }} />
                    </div>
                    <span className="text-right font-mono text-xs text-muted-foreground">{p.count} · {p.avgConfidence.toFixed(1)}★</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="surface p-5">
              <h2 className="text-sm font-medium">Review next</h2>
              <p className="mt-1 text-xs text-muted-foreground">Lowest average confidence</p>
              <ol className="mt-4 space-y-2">
                {weak.map((w, i) => (
                  <li key={w.pattern} className="flex items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                    <span className="font-medium">{w.pattern}</span>
                    <span className="ml-auto font-mono text-xs text-warning">{w.avgConfidence.toFixed(1)} / 5</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="surface mt-6 overflow-hidden">
            <h2 className="border-b px-5 py-3 text-sm font-medium">Problem log</h2>
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link to="/problems/$id" params={{ id: r.id }} search={{practice:false}} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-accent">
                    <span className="font-medium">{r.title}</span>
                    <Badge variant="outline">{r.pattern}</Badge>
                    <Badge variant="secondary">{r.difficulty}</Badge>
                    <Badge variant="outline">{r.practice_status === "solved" ? "Solvable" : r.practice_status === "retry" ? "Practice again" : "Not tried yet"}</Badge>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{r.intuition !== undefined && <>intuition {r.intuition}% · </>}confidence {r.confidence}/5</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
