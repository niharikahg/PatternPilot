import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Code2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewCode, type CodeFeedback } from "@/lib/code-review.functions";
import type { SavedProblem } from "@/lib/local-log";

export function CodePractice({ problem, attempt, onSave }: { problem: string; attempt?: SavedProblem["code_attempt"]; onSave: (attempt: NonNullable<SavedProblem["code_attempt"]>) => void }) {
  const review = useServerFn(reviewCode);
  const [language, setLanguage] = useState<"python" | "java" | "javascript">(attempt?.language === "java" ? "java" : attempt?.language === "javascript" ? "javascript" : "python");
  const [code, setCode] = useState(attempt?.code ?? "");
  const [feedback, setFeedback] = useState<CodeFeedback | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setPending(true); setError(""); setFeedback(null);
    onSave({ language, code });
    try { const result = await review({ data: { problem, language, code } }); setFeedback(result); onSave({ language, code, feedback: JSON.stringify(result) }); }
    catch (e) { setError(e instanceof Error ? e.message : "Review unavailable."); }
    finally { setPending(false); }
  };
  return <section className="border-y py-6" aria-label="Code practice">
    <h3 className="flex items-center gap-2 font-display text-xl font-bold"><Code2 className="size-5 text-primary" /> Your turn to code</h3>
    <div className="my-4 flex gap-1">{(["python", "java", "javascript"] as const).map((lang) => <Button key={lang} variant={language === lang ? "secondary" : "ghost"} size="sm" aria-pressed={language === lang} disabled={pending} onClick={() => { setLanguage(lang); setFeedback(null); onSave({ language: lang, code }); }}>{lang === "javascript" ? "JavaScript" : lang === "java" ? "Java" : "Python"}</Button>)}</div>
    <label htmlFor="practice-code" className="sr-only">Your solution</label>
    <Textarea id="practice-code" value={code} disabled={pending} onChange={(event) => { setCode(event.target.value); setFeedback(null); onSave({ language, code: event.target.value }); }} placeholder="Write your solution here…" className="min-h-64 bg-code font-mono text-sm" spellCheck={false} />
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">AI code review · Estimated complexity, not measured runtime or executed tests.</p><Button disabled={pending || !code.trim()} onClick={() => void submit()}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{pending ? "Reviewing your solution…" : "Review my code"}</Button></div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {feedback && <div className="mt-5 space-y-4" aria-live="polite"><h4 className="font-semibold">{feedback.verdict}</h4><p className="font-mono text-sm">Time: {feedback.time} · Space: {feedback.space}</p><p className="text-sm leading-relaxed">{feedback.explanation}</p>{feedback.issues.length > 0 && <div><h4 className="font-semibold">Watch out for</h4><ul className="list-disc pl-5 text-sm">{feedback.issues.map((item) => <li key={item}>{item}</li>)}</ul></div>}<div><h4 className="font-semibold">Make it better</h4><ul className="list-disc pl-5 text-sm">{feedback.improvements.map((item) => <li key={item}>{item}</li>)}</ul></div><details><summary className="cursor-pointer text-sm font-semibold">Suggested solution</summary><pre className="mt-3 overflow-x-auto rounded-md border bg-code p-4 text-sm"><code>{feedback.improved_code}</code></pre></details></div>}
  </section>;
}