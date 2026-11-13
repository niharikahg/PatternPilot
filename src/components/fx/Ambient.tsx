import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const GLYPHS = ["{ }", "O(n)", "[i]", "→", "λ", "∑", "<>", "#", "i++", "log n", "( )", "≠"];

/** Floating code glyphs + cursor-following glow. Purely decorative. */
export function Ambient({ density = 14 }: { density?: number }) {
  const [items, setItems] = useState<{ x: number; y: number; g: string; d: number; s: number }[]>([]);
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    setItems(Array.from({ length: density }, (_, i) => ({
      x: Math.random() * 100, y: Math.random() * 100,
      g: GLYPHS[i % GLYPHS.length], d: 6 + Math.random() * 8, s: 0.8 + Math.random() * 1.2,
    })));
    const on = (e: PointerEvent) => { mx.set(e.clientX - 200); my.set(e.clientY - 200); };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, [density, mx, my]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div style={{ x: sx, y: sy }} className="absolute h-[400px] w-[400px] rounded-full bg-highlight/25 blur-3xl" />
      <motion.div animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-coral/15 blur-3xl" />
      <motion.div animate={{ x: [0, -70, 50, 0], y: [0, 50, -30, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
      {items.map((it, i) => (
        <motion.span key={i}
          className="absolute font-mono font-bold text-foreground/[0.07]"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.s}rem` }}
          animate={{ y: [0, -30, 0], rotate: [0, 8, -6, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: it.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
          {it.g}
        </motion.span>
      ))}
    </div>
  );
}
