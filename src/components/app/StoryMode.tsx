import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/types";

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((x) => (x >= text.length ? x : x + 2)), 22);
    return () => clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

export function StoryMode({ story, onAnswer }: { story: Story; onAnswer: (correct: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [picked, setPicked] = useState<Record<number, number[]>>({});
  const scene = story.scenes[i];
  const q = scene?.question ?? null;
  const solved = q ? (picked[i] ?? []).includes(q.answer) : true;
  const last = i >= story.scenes.length - 1;

  useEffect(() => {
    if (!open || !playing || !solved || last) return;
    const t = setTimeout(() => setI((x) => x + 1), 4200);
    return () => clearTimeout(t);
  }, [open, playing, solved, last, i]);

  if (!scene) return null;
  const choose = (o: number) => {
    if (!q || solved) return;
    const tries = picked[i] ?? [];
    if (tries.includes(o)) return;
    setPicked({ ...picked, [i]: [...tries, o] });
    if (tries.length === 0) onAnswer(o === q.answer);
  };

  return (
    <>
      <Button size="sm" onClick={() => { setI(0); setOpen(true); }}>
        <Clapperboard className="h-4 w-4" /> Play the story
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
          <DialogTitle className="border-b px-5 py-3 text-base">{story.title}</DialogTitle>
          <div className="relative h-72 overflow-hidden bg-gradient-to-b from-primary-soft to-background sm:h-80">
            {scene.actors.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={false}
                animate={{
                  left: `${a.x}%`, top: `${a.y}%`,
                  scale: a.state === "active" ? 1.25 : 1,
                  opacity: a.state === "faded" ? 0.25 : 1,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <motion.div
                  animate={a.state === "active" ? { y: [0, -8, 0] } : { y: 0 }}
                  transition={{ repeat: a.state === "active" ? Infinity : 0, duration: 0.9 }}
                  className={cn("text-4xl drop-shadow", a.state === "done" && "grayscale-0")}
                >
                  {a.emoji}
                </motion.div>
                <div className={cn("mt-1 rounded-full border bg-card px-2 font-mono text-xs", a.state === "active" && "border-primary bg-primary text-primary-foreground", a.state === "done" && "border-success text-success")}>
                  {a.label}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-4 p-5">
            <AnimatePresence mode="wait">
              <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="min-h-12 text-base leading-relaxed">
                <Typewriter text={scene.caption} />
              </motion.p>
            </AnimatePresence>
            {q && (
              <div className="rounded-lg border-2 border-dashed border-primary/50 p-4">
                <p className="text-sm font-medium">{q.prompt}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {q.options.map((o, k) => {
                    const tried = (picked[i] ?? []).includes(k);
                    return (
                      <motion.button
                        key={k}
                        whileTap={{ scale: 0.95 }}
                        animate={tried && k !== q.answer ? { x: [0, -6, 6, 0] } : {}}
                        onClick={() => choose(k)}
                        className={cn("rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                          tried && k === q.answer && "border-success bg-success/15",
                          tried && k !== q.answer && "border-destructive/60 opacity-60")}
                      >
                        {o}
                      </motion.button>
                    );
                  })}
                </div>
                {!solved && (picked[i]?.length ?? 0) > 0 && <p className="mt-2 text-sm text-muted-foreground">Hint: {q.hint}</p>}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {story.scenes.map((_, k) => (
                  <div key={k} className={cn("h-1.5 flex-1 rounded-full", k <= i ? "bg-primary" : "bg-muted")} />
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              {last ? (
                <Button size="sm" variant="outline" onClick={() => setI(0)}><RotateCcw className="h-4 w-4" /> Replay</Button>
              ) : (
                <Button size="sm" disabled={!solved} onClick={() => setI(i + 1)}>Next scene</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
