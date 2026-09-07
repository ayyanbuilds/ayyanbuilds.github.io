/* =============================================================
   utils.js — small shared helpers
   ============================================================= */
export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Runs `fn` once, the first time element enters the viewport. */
export function onFirstIntersect(el, fn, rootMargin = "0px") {
  if (!el) return;
  if (!("IntersectionObserver" in window)) {
    fn();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fn();
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin }
  );
  io.observe(el);
}
