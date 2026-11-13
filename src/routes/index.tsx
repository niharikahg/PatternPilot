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

const MARQUEE = ["Two Sum", "Sliding Window", "Binary Search", "Number of Islands", "Dynamic Programming", "Two Pointers", "BFS / DFS", "Heaps", "Backtracking", "Climbing Stairs"];

function Index() {
  return (
    <main className="overflow-hidden">
      <section className="relative">
        <div className="bg-hero pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-highlight" /> For career switchers and new grads
          </span>
          <h1 className="mt-6 max-w-5xl text-5xl font-extrabold leading-[0.95] md:text-8xl">
            Learn the <span className="rounded-2xl bg-highlight px-3 text-highlight-foreground">pattern</span>,
            <br />not just the answer.
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            Turn any coding interview problem into an animated story, a complexity race, and a six-step walkthrough you actually remember.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-pop">
              <Link to="/workspace">Start a problem <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
              <Link to="/dashboard">View dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-y bg-foreground py-4 text-background">
        <div className="marquee flex w-max gap-10 font-display text-2xl font-bold">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">{m}<span className="text-highlight">✦</span></span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="max-w-2xl text-4xl font-bold md:text-5xl">Six steps. Every problem. Zero guesswork.</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.t} className={"group rounded-3xl border p-7 transition-all hover:-translate-y-1 hover:shadow-pop " + (i === 0 ? "bg-highlight text-highlight-foreground" : i === 4 ? "bg-foreground text-background" : "bg-card")}>
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-background/90 text-foreground"><s.icon className="h-5 w-5" /></span>
                <span className="font-display text-4xl font-extrabold opacity-20">0{i + 1}</span>
              </div>
              <h3 className="mt-10 text-2xl font-bold">{s.t}</h3>
              <p className="mt-2 text-sm opacity-75">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-10 text-background md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-highlight opacity-80 blur-3xl" />
          <h2 className="relative max-w-2xl text-4xl font-bold md:text-6xl">Your next interview starts with one problem.</h2>
          <Button asChild size="lg" className="relative mt-8 h-12 rounded-full bg-highlight px-7 text-base text-highlight-foreground hover:bg-highlight/90">
            <Link to="/workspace">Open the workspace <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-4 pb-12 text-sm text-muted-foreground">PatternPilot · Interview prep, one pattern at a time.</footer>
    </main>
  );
}
