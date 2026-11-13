import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, Gauge, Layers, ListChecks, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PatternPilot — Structured coding interview prep" },
      { name: "description", content: "Paste any coding interview problem and get a 6-step breakdown: understand, examples, pattern, approach, solution, complexity." },
      { property: "og:title", content: "PatternPilot — Structured coding interview prep" },
      { property: "og:description", content: "A calm, structured workspace for career switchers and new grads preparing for coding interviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: BookOpen, t: "Understand", d: "Restate the problem, constraints, and questions to ask." },
  { icon: ListChecks, t: "Examples", d: "Test cases including the edge cases interviewers love." },
  { icon: Layers, t: "Pattern", d: "Name the pattern and learn how to spot it next time." },
  { icon: Workflow, t: "Approach", d: "Brute force first, then the optimized idea in pseudocode." },
  { icon: Code2, t: "Solution", d: "Commented code in Python, Java, and JavaScript." },
  { icon: Gauge, t: "Complexity", d: "Big-O in plain English, plus likely follow-ups." },
];

function Index() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="py-20 md:py-28">
        <p className="text-sm font-medium text-primary">For career switchers and new grads</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Learn the pattern, not just the answer.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          PatternPilot turns any coding interview problem into a structured, six-step walkthrough — with
          visual traces, a problem log, and a view of the patterns you need to review.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/workspace">Open workspace <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/dashboard">View dashboard</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-px overflow-hidden rounded-lg border bg-border pb-px sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.t} className="bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <s.icon className="h-4 w-4 text-primary" />
              <h3 className="font-medium">{s.t}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>
      <footer className="py-12 text-sm text-muted-foreground">PatternPilot · Interview prep, one pattern at a time.</footer>
    </main>
  );
}
