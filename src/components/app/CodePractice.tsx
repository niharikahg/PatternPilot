import { useEffect, useId, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Code2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewCode, type CodeFeedback } from "@/lib/code-review.functions";
import type { SavedProblem } from "@/lib/local-log";
import { reviewBadge } from "@/lib/practice";
import { Badge } from "@/components/ui/badge";
import { hintContent } from "@/lib/practice-hints";
import { optimalityScore } from '@/lib/optimality';
import { indentCode, newlineCode } from '@/lib/editor-indent';
import { codeStarter } from '@/lib/code-starter';
import { OptimalityReview } from './OptimalityReview';

export function CodePractice({ problem, attempt, onSave, onSubmitted, onReviewed, heading = "Your turn to code", failingInput, firstHint, solutionsUnlocked = true, starters }: { problem: string; attempt?: SavedProblem["code_attempt"]; onSave: (attempt: NonNullable<SavedProblem["code_attempt"]>) => void; onSubmitted?: () => void; onReviewed?: (feedback: CodeFeedback) => void; heading?: string; failingInput?: string; firstHint?: string; solutionsUnlocked?: boolean; starters?: Record<'python'|'java'|'javascript',string> }) {
  const review = useServerFn(reviewCode);
  const editorId = useId();
  const [waitingSeconds,setWaitingSeconds] = useState(0);
  const [language, setLanguage] = useState<"python" | "java" | "javascript">(attempt?.language === "java" ? "java" : attempt?.language === "javascript" ? "javascript" : "python");
  const [code, setCode] = useState(attempt?.code ?? (starters ? codeStarter(starters[language], language) : ""));
  const [feedback, setFeedback] = useState<CodeFeedback | null>(() => {
    try { return attempt?.feedback ? JSON.parse(attempt.feedback) as CodeFeedback : null; } catch { return null; }
  });
  const [pending, setPending] = useState(false);
  useEffect(()=>{if(!pending)return;setWaitingSeconds(0);const timer=setInterval(()=>setWaitingSeconds(s=>s+1),1000);return()=>clearInterval(timer);},[pending]);

  const [error, setError] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const hint = hintContent(hintLevel, feedback?.failing_input, failingInput);
  const editor = useRef<HTMLTextAreaElement>(null);
  const submit = async () => {
    setPending(true); setError(""); setFeedback(null); setHintLevel(0);
    onSave({ language, code });
    onSubmitted?.();
    try { const result = await review({ data: { problem, language, code } }); setFeedback(result); onReviewed?.(result); onSave({ language, code, feedback: JSON.stringify(result) }); }
    catch (e) { setError(e instanceof Error ? e.message : "Review unavailable."); }
    finally { setPending(false); }
  };
  return <section className="border-y py-6" aria-label="Code practice">
    <h3 className="flex items-center gap-2 font-display text-xl font-bold"><Code2 className="size-5 text-primary" /> {heading}</h3>
    <div className="my-4 flex gap-1">{(["python", "java", "javascript"] as const).map((lang) => <Button key={lang} variant={language === lang ? "secondary" : "ghost"} size="sm" aria-pressed={language === lang} disabled={pending} onClick={() => { const next = starters && code === codeStarter(starters[language],language) ? codeStarter(starters[lang],lang) : code; setLanguage(lang); setCode(next); setFeedback(null); onSave({ language: lang, code: next }); }}>{lang === "javascript" ? "JavaScript" : lang === "java" ? "Java" : "Python"}</Button>)}</div>
    <label htmlFor={editorId} className="sr-only">Your solution</label>
    <Textarea ref={editor} id={editorId} onKeyDown={event=>{if(!['Tab','Enter'].includes(event.key)||event.shiftKey||event.nativeEvent.isComposing)return;event.preventDefault();const next=event.key==='Tab'?indentCode(code,event.currentTarget.selectionStart,event.currentTarget.selectionEnd):newlineCode(code,event.currentTarget.selectionStart,event.currentTarget.selectionEnd,language);setCode(next.code);setFeedback(null);setHintLevel(0);onSave({language,code:next.code});requestAnimationFrame(()=>editor.current?.setSelectionRange(next.cursor,next.cursor));}} value={code} disabled={pending} onChange={(event) => { setCode(event.target.value); setFeedback(null); setHintLevel(0); onSave({ language, code: event.target.value }); }} placeholder="Write your solution here…" className="min-h-64 bg-code font-mono text-sm" spellCheck={false} />
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">AI code review · Estimated complexity, not measured runtime or executed tests.</p><Button disabled={pending || !code.trim()} onClick={() => void submit()}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{pending ? "Reviewing your solution…" : "Review my code"}</Button></div>
    {pending && <div role="status" className="mt-4 space-y-2 text-sm"><p>Reviewing correctness, stated constraints, and edge cases; estimating time and space.</p><p className="text-muted-foreground">{waitingSeconds}s elapsed · {waitingSeconds>12?'Still waiting for the AI assessment; your draft is safe.':'Waiting for the AI assessment…'}</p></div>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {feedback?.optimality && <OptimalityReview assessment={feedback.optimality} verdict={feedback.verdict} revealTargets={solutionsUnlocked} />}
    {feedback && <div className="mt-5 space-y-4" aria-live="polite"><Badge>{failingInput&&feedback.verdict==='Looks correct'?'Bug fixed ✓':reviewBadge(feedback.verdict, feedback.issues)}</Badge><p className="text-xs text-muted-foreground">AI assessment, not executed tests.</p><p className="font-mono text-sm">Time: {feedback.time} · Space: {feedback.space}</p>{feedback.verdict!=='Looks correct'&&<><div className="flex flex-wrap gap-2"><Button onClick={()=>{setFeedback(null);setHintLevel(0);editor.current?.focus();}}>Fix it and re-review</Button><Button variant="outline" onClick={()=>setHintLevel(level=>level>=2?0:level+1)}>{hintLevel===0?'Show a hint':hintLevel===1?'Explain the bug':'Hide hints'}</Button></div>{hintLevel===1&&<p className="font-mono text-sm" role="status">{firstHint ?? (hint.input?`Try ${hint.input}`:'No specific failing input is available for this saved review.')}</p>}</>}{solutionsUnlocked&&(feedback.verdict==='Looks correct'||hint.explanation)&&<><p className="text-sm leading-relaxed">{feedback.explanation}</p>{feedback.issues.length > 0 && <div><h4 className="font-semibold">Watch out for</h4><ul className="list-disc pl-5 text-sm">{feedback.issues.map((item) => <li key={item}>{item}</li>)}</ul></div>}{(!feedback.optimality||optimalityScore(feedback.verdict,feedback.optimality)?.total!==100)&&<div><h4 className="font-semibold">Make it better</h4><ul className="list-disc pl-5 text-sm">{feedback.improvements.map((item) => <li key={item}>{item}</li>)}</ul></div>}<details><summary className="cursor-pointer text-sm font-semibold">Suggested solution</summary><pre className="mt-3 overflow-x-auto rounded-md border bg-code p-4 text-sm"><code>{feedback.improved_code}</code></pre></details></>}</div>}
  </section>;
}