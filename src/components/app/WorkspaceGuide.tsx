import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CircleHelp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUIDE_KEY = "patternpilot-workspace-guide-v1";

export function WorkspaceGuide({ onTryExample }: { onTryExample: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { setOpen(localStorage.getItem(GUIDE_KEY) !== "dismissed"); }
    catch { setOpen(true); }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(GUIDE_KEY, "dismissed"); } catch { /* Guidance still works without storage. */ }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} aria-expanded={open}>
          <CircleHelp className="size-4" /> Quick guide
        </Button>
      </div>
      {open && (
        <section aria-label="Quick start guide" className="relative mt-2 border-y border-primary/25 bg-primary-soft px-4 py-5 sm:px-6">
          <Button variant="ghost" size="icon" onClick={dismiss} aria-label="Dismiss guide" className="absolute right-2 top-2"><X className="size-4" /></Button>
          <h2 className="pr-8 font-display text-xl font-bold">Your first problem, one step at a time.</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: "Pick a problem", text: "Choose one below, or paste your own question." },
              { icon: Sparkles, title: "Find your approach", text: "Press Show me the approach. Try a thinking question while you wait." },
              { icon: ArrowRight, title: "Try, then reveal", text: "Make your guesses, explore the story, and try your code. Reveal answers after your attempt, then save." },
            ].map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 font-mono text-sm">{index + 1}</span>
                <div><div className="flex items-center gap-2 text-sm font-semibold"><Icon className="hidden size-4 shrink-0 lg:block" />{title}</div><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { dismiss(); onTryExample(); }}>Try Two Sum <ArrowRight className="size-4" /></Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>I’ll pick my own</Button>
          </div>
        </section>
      )}
    </div>
  );
}