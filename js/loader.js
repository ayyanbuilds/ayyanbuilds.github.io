/* =============================================================
   loader.js — "AYYAN BUILDS" cinematic intro screen
   ============================================================= */
import { reduceMotion } from "./utils.js";

export function initLoader() {
  const loader = document.getElementById("loader");
  const wordEl = document.getElementById("loaderWord");
  const barFill = document.getElementById("loaderBarFill");
  const pctEl = document.getElementById("loaderPct");
  if (!loader) return;

  // Build "AYYAN BUILDS" as per-letter spans so it can be revealed with a stagger.
  if (wordEl) {
    const text = "AYYAN BUILDS";
    wordEl.innerHTML = "";
    text.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0\u00A0" : ch;
      wordEl.appendChild(span);
    });
  }

  let progress = 0;
  let realLoadDone = false;

  function setProgress(p) {
    progress = Math.min(100, p);
    if (barFill) barFill.style.width = progress + "%";
    if (pctEl) pctEl.textContent = Math.round(progress) + "%";
  }

  // Fake-but-honest progress: ticks up steadily, then jumps to 100 once
  // window 'load' actually fires (or a timeout safety net trips).
  const tick = setInterval(() => {
    if (progress < 88) setProgress(progress + (2 + Math.random() * 6));
    if (realLoadDone) {
      setProgress(100);
      clearInterval(tick);
      finish();
    }
  }, 90);

  function finish() {
    const doFinish = () => {
      loader.classList.add("loaded");
      document.body.classList.remove("is-loading");
    };
    if (window.gsap && wordEl && !reduceMotion) {
      gsap.to(wordEl.children, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.03
      });
      setTimeout(doFinish, 500);
    } else {
      doFinish();
    }
  }

  window.addEventListener("load", () => {
    realLoadDone = true;
  });
  // Safety net in case 'load' is slow or never fires cleanly.
  setTimeout(() => {
    realLoadDone = true;
  }, 3200);

  // Animate the wordmark in immediately.
  if (window.gsap && wordEl && !reduceMotion) {
    gsap.set(wordEl.children, { y: "120%", opacity: 0 });
    gsap.to(wordEl.children, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power4.out",
      stagger: 0.025,
      delay: 0.15
    });
  } else if (wordEl) {
    Array.from(wordEl.children).forEach((s) => {
      s.style.transform = "none";
      s.style.opacity = "1";
    });
  }
}
