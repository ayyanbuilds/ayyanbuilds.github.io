/* =============================================================
   AYYAN SUBHANI — PORTFOLIO
   main.js — entry point. Wires up Lenis smooth scroll + GSAP
   ScrollTrigger, then boots each feature module.
   ============================================================= */
import { reduceMotion } from "./utils.js";
import { initLoader } from "./loader.js";
import { initCursor } from "./cursor.js";
import { initMagnetic } from "./magnetic.js";
import { initNav } from "./nav.js";
import { initReveal } from "./reveal.js";
import { initHero3D } from "./hero3d.js";
import { initProjects } from "./projects.js";

document.documentElement.classList.add("js");

/* ---- Smooth scroll (Lenis honors prefers-reduced-motion itself) ---- */
if (window.Lenis) {
  const lenis = new window.Lenis({ anchors: true });

  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", window.ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* ---- Footer year ---- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Boot feature modules ---- */
initLoader();
initCursor();
initMagnetic();
initNav();
initReveal();
initHero3D();
initProjects();

void reduceMotion; // available to every module that imported it above
