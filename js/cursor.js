/* =============================================================
   cursor.js — premium custom cursor (desktop only)
   Smooth-follow dot + lagging outer ring, with hover states for
   links/buttons ("is-link") and project cards ("is-project").
   ============================================================= */
import { isCoarsePointer, lerp } from "./utils.js";

export function initCursor() {
  if (isCoarsePointer) return; // mobile/touch: never enable custom cursor

  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  document.body.classList.add("has-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    },
    { passive: true }
  );

  function raf() {
    ringX = lerp(ringX, mouseX, 0.18);
    ringY = lerp(ringY, mouseY, 0.18);
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  window.addEventListener("mousedown", () => ring.classList.add("is-down"), { passive: true });
  window.addEventListener("mouseup", () => ring.classList.remove("is-down"), { passive: true });

  // Hover states — any element can opt in via data-cursor="link" / "project" / "drag"
  const hoverables = document.querySelectorAll(
    'a, button, [data-cursor], [data-magnetic]'
  );
  hoverables.forEach((el) => {
    const kind = el.getAttribute("data-cursor") || (el.closest("[data-project]") ? "project" : "link");
    el.addEventListener("mouseenter", () => ring.classList.add("is-" + kind), { passive: true });
    el.addEventListener("mouseleave", () => ring.classList.remove("is-" + kind), { passive: true });
  });

  document.querySelectorAll("[data-project]").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-project"), { passive: true });
    el.addEventListener("mouseleave", () => ring.classList.remove("is-project"), { passive: true });
  });
}
