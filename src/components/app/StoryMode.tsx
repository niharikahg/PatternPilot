import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clapperboard, Loader2, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/types";
import { narrateStory } from "@/lib/story-audio.functions";
import { sceneAtProgress, storyTimeline } from "@/lib/story-playback";

const CHAPTERS = ["Once upon a problem", "The mission", "A twist in the tale", "The clever discovery", "A happy ending", "From story to solution"];

export function StoryMode({ story, onAnswer }: { story: Story; onAnswer: (correct: boolean) => void }) {
  const narrate = useServerFn(narrateStory);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [src, setSrc] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const preparingRef = useRef(false);
  const openRef = useRef(false);
  const scene = story.scenes[i];
  const timeline = storyTimeline(story);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (open && playing && src) {
      void audio.play().catch(() => { setPlaying(false); setError("Press Play to start the narration."); });
    } else audio.pause();
  }, [open, playing, src]);

  // Captions-only playback never waits for a quiz answer.
  useEffect(() => {
    if (!open || !playing || src || loading || !scene || finished) return;
    const duration = Math.max(5000, scene.caption.split(/\s+/).length * 420);
    const timer = setTimeout(() => {
      if (i >= story.scenes.length - 1) { setFinished(true); setPlaying(false); }
      else setI(i + 1);
    }, duration);
    return () => clearTimeout(timer);
  }, [open, playing, src, loading, scene, finished, i, story.scenes.length]);

  const prepare = async () => {
    if (preparingRef.current || src) return;
    preparingRef.current = true;
    setLoading(true); setPlaying(false);
    try {
      const result = await narrate({ data: { captions: story.scenes.map((s) => s.caption) } });
      const bytes = Uint8Array.from(atob(result.base64), (char) => char.charCodeAt(0));
      setSrc(URL.createObjectURL(new Blob([bytes], { type: result.contentType })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Narration is unavailable. Watch with captions instead.");
    } finally { setLoading(false); }
  };
  useEffect(() => { void prepare(); }, []);
  const start = () => {
    openRef.current = true;
    setOpen(true); setI(0); setFinished(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(true);
  };
  const jump = (next: number) => {
    setI(next); setFinished(false);
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) audio.currentTime = (timeline[next]?.start ?? 0) * audio.duration;
  };
  if (!scene) return null;

  return <>
    <audio ref={audioRef} src={src ?? undefined} preload="auto" muted={muted} onTimeUpdate={() => {
      const audio = audioRef.current;
      if (audio && audio.duration > 0) setI(sceneAtProgress(story, audio.currentTime / audio.duration));
    }} onEnded={() => { setFinished(true); setPlaying(false); }} onError={() => { setPlaying(false); setError("The audio couldn’t play. You can watch with captions instead."); }} />
    <section className="flex flex-wrap items-center gap-5 border-y border-primary/25 bg-primary-soft px-5 py-6" aria-label="Story cinema">
      <div aria-hidden="true" className="flex items-center gap-1 text-4xl">
        <span>🎬</span><span className="text-3xl">{story.scenes[0]?.actors[0]?.emoji ?? "✨"}</span>
      </div>
      <div className="min-w-0 flex-1 basis-48">
        <span className="text-xs font-semibold uppercase text-primary">Story cinema · Narrated</span>
        <h3 className="mt-1 font-display text-2xl font-bold">{story.title}</h3>
      </div>
      <div className="flex flex-col items-start gap-2">
        <Button size="lg" disabled={loading || (!src && !error)} onClick={start} className="h-12 gap-3 rounded-full px-6 shadow-pop">{loading ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5" />}{loading || (!src && !error) ? "Preparing story audio…" : src ? "Watch the story" : "Watch with captions"}{src && <Volume2 className="size-4" />}</Button>
        {error && <p className="max-w-xs text-xs text-muted-foreground">{error}</p>}
      </div>
    </section>
    <Dialog open={open} onOpenChange={(value) => { openRef.current = value; setOpen(value); if (!value) setPlaying(false); }}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] max-w-4xl gap-0 overflow-y-auto rounded-lg p-0">
        <div className="border-b px-5 py-4 pr-12">
          <DialogTitle className="font-display text-xl">{story.title}</DialogTitle>
          <DialogDescription className="mt-1">{CHAPTERS[i] ?? `Chapter ${i + 1}`} · {i + 1} / {story.scenes.length}</DialogDescription>
        </div>
        <div className="relative h-64 overflow-hidden border-b bg-primary-soft sm:h-96">
          <div className="absolute inset-x-0 bottom-0 h-12 border-t border-primary/20 bg-background/60" />
          <span className="absolute left-4 top-4 font-mono text-xs text-primary">CHAPTER {String(i + 1).padStart(2, "0")}</span>
          {scene.actors.map((a) => <motion.div key={a.id} initial={false}
            animate={{ left: `${Math.min(85, Math.max(15, a.x))}%`, top: `${Math.min(75, Math.max(25, a.y))}%`, scale: a.state === "active" ? 1.15 : 1, opacity: a.state === "faded" ? 0.3 : 1 }}
            transition={{ duration: reduced ? 0 : 1.5, ease: "easeInOut" }}
            className="absolute w-14 -translate-x-1/2 -translate-y-1/2 text-center sm:w-24">
            <motion.div animate={!reduced && playing && a.state === "active" ? { y: [0, -12, 0], rotate: [0, -5, 5, 0] } : { y: 0, rotate: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl sm:text-6xl">{a.emoji}</motion.div>
            <div className={cn("mt-2 break-words rounded-md border bg-card px-1 py-1 text-xs font-medium", a.state === "active" && "border-primary text-primary", a.state === "done" && "border-success text-success")}>{a.label}</div>
          </motion.div>)}
        </div>
        <div className="space-y-4 p-5">
          <p className="min-h-20 text-base leading-relaxed">{scene.caption}</p>
          {error && <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><p className="flex-1">{error}</p><Button variant="outline" size="sm" onClick={() => { setSrc(null); setError(""); setPlaying(true); }}>Watch with captions</Button></div>}
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Button variant="ghost" size="icon" aria-label="Previous chapter" disabled={i === 0 || loading} onClick={() => jump(i - 1)}><SkipBack className="size-4" /></Button>
            <Button size="icon" aria-label={playing ? "Pause story" : "Play story"} disabled={loading} onClick={() => { if (finished) jump(0); setPlaying(!playing); }}><span>{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</span></Button>
            <Button variant="ghost" size="icon" aria-label="Next chapter" disabled={i >= story.scenes.length - 1 || loading} onClick={() => jump(i + 1)}><SkipForward className="size-4" /></Button>
            <div className="flex min-w-20 flex-1 gap-1">{story.scenes.map((_, index) => <span key={index} className={cn("h-1.5 flex-1 rounded-full", index <= i ? "bg-primary" : "bg-muted")} />)}</div>
            <Button variant="ghost" size="icon" aria-label={muted ? "Unmute narration" : "Mute narration"} disabled={!src} onClick={() => setMuted(!muted)}>{muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</Button>
            <Button variant="ghost" size="icon" aria-label="Replay story" disabled={loading} onClick={() => { jump(0); setPlaying(true); }}><RotateCcw className="size-4" /></Button>
          </div>
          {finished && <section className="space-y-4 border-t pt-4"><h4 className="flex items-center gap-2 font-display text-lg font-bold"><Clapperboard className="size-5" /> The end. Your turn?</h4>
            {story.scenes.map((s, index) => s.question && <div key={index}>
              <p className="text-sm font-medium">{s.question.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-2">{s.question.options.map((option, optionIndex) => <Button key={option} variant="outline" size="sm" disabled={picked[index] !== undefined} className={cn("h-auto whitespace-normal text-left", picked[index] === optionIndex && (optionIndex === s.question?.answer ? "border-success bg-success/15" : "border-destructive"))} onClick={() => { setPicked((prev) => ({ ...prev, [index]: optionIndex })); onAnswer(optionIndex === s.question?.answer); }}>{option}</Button>)}</div>
              {picked[index] !== undefined && <p className="mt-2 text-sm text-muted-foreground">{s.question.options[s.question.answer]} · {s.question.hint}</p>}
            </div>)}
            <Button variant="ghost" onClick={() => { openRef.current = false; setOpen(false); setPlaying(false); }}>Back to the breakdown <ArrowRight className="size-4" /></Button>
          </section>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
