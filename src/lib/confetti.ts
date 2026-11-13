export async function celebrate(power = 1) {
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: Math.min(220, 60 * power), spread: 60 + power * 15, origin: { y: 0.7 }, zIndex: 9999 });
}
