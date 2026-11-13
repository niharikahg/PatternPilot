# Make PatternPilot immersive: Story Mode + Complexity Lab

Goal: turn a long, boring problem into something you *watch, play with and predict*, instead of read. Two new experiences, plus playful rewards.

## 1. Story Mode (understand the long problem)
A new "Play the story" button on every breakdown opens a full-screen, animated scene.
- The AI rewrites the problem as a tiny story with a cast: e.g. Two Sum becomes "a shopkeeper looking for two coins that make exactly 9". Each input item becomes a character or object on stage.
- Scenes auto-play like a short cartoon (4-6 scenes): the setup, the goal, a "trap" (the slow way), the "aha" (the pattern), the win.
- Characters move, glow and stack using smooth animations; captions appear typewriter-style. Tap to advance, or press play.
- At each "aha" moment the story pauses and asks you a one-tap question ("Which shelf would you check next?"). Right answers trigger confetti; wrong ones show a short hint and let you retry.

## 2. Complexity Lab (feel the Big-O instead of memorizing it)
A playground section under the solution.
- A slider for input size n (10 to 1,000,000). Two racing lanes, "Slow way" vs "Smart way", animate a counter of operations live as you drag, with a growing bar/curve.
- Before revealing, you place a bet: pick the time complexity from cards (O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)). Lock it in, then the race runs and reveals if you were right.
- "Spot the loop" mini-game: the solution code is shown and you tap the lines that cause the cost; tapped lines light up with how many times they run.
- A memory meter shows space usage filling up the same way.

## 3. Playful rewards (light layer tying it together)
- Combo meter: consecutive correct predictions in Story Mode and the Lab build a combo with escalating confetti and a pop-up ("3x combo!").
- "Intuition score" per pattern saved with each problem and shown on the dashboard next to confidence.

## Technical details
- Extend the AI JSON schema and `Breakdown` type with `story` { cast[], scenes[] { caption, actors[{id, label, emoji, x, y, state}], question?{prompt, options[], answer, hint} } } and `complexity_lab` { brute_force_ops, optimized_ops (formula keys like "n","n^2","nlogn"), space, code_hotspots[{line, runs}] }. Keep both in sync per AGENTS.md; old saved rows without these fields render without the new buttons.
- New components: `StoryMode.tsx` (framer-motion scenes in a dialog), `ComplexityLab.tsx` (slider, operation counters computed client-side from the formula key, bet cards, hotspot code view), `Confetti` via canvas-confetti.
- Add `bun add framer-motion canvas-confetti`.
- Store intuition score in the local problem log; extend `stats.ts` with a test for score averaging and combo counting.
- Playful tokens (celebration colors, glow shadows) added to `src/styles.css`.
