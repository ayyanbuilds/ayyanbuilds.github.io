/* =============================================================
   magnetic.js — magnetic-pull effect for buttons/links marked
   with [data-magnetic]. Skipped on touch devices.
   ============================================================= */
import { isCoarsePointer, reduceMotion } from "./utils.js";

export function initMagnetic() {
  if (isCoarsePointer || reduceMotion) return;

  const strength = 0.35;
  const radius = 70;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const inner = el.querySelector("span") || el;

    el.addEventListener(
      "mousemove",
      (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        if (window.gsap) {
          gsap.to(inner, {
            x: relX * strength,
            y: relY * strength,
            duration: 0.4,
            ease: "power3.out"
          });
          gsap.to(el, {
            x: relX * strength * 0.4,
            y: relY * strength * 0.4,
            duration: 0.4,
            ease: "power3.out"
          });
        } else {
          inner.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
        }
      },
      { passive: true }
    );

    el.addEventListener("mouseleave", () => {
      if (window.gsap) {
        gsap.to(inner, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      } else {
        inner.style.transform = "translate(0,0)";
      }
    });
  });

  void radius; // reserved for a future proximity-based activation radius
}
