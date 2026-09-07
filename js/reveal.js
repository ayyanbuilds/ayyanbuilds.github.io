/* =============================================================
   reveal.js — GSAP scroll reveals, heading text-split, skill
   bars, timeline fill, and the signature scrubber (scroll
   progress readout styled like a video editor's timecode).
   ============================================================= */
import { reduceMotion } from "./utils.js";

function splitHeadingWords(heading) {
  const words = heading.textContent.trim().split(/\s+/);
  heading.innerHTML = words
    .map(
      (w) =>
        `<span class="word" style="display:inline-block; overflow:hidden;"><span style="display:inline-block;">${w}</span></span>`
    )
    .join(" ");
  return heading.querySelectorAll(".word > span");
}

export function initReveal() {
  if (!window.gsap) return;
  gsap.registerPlugin(window.ScrollTrigger || {});

  /* ---- Generic [data-reveal] fade-up ---- */
  if (!reduceMotion) {
    gsap.utils.toArray("[data-reveal]").forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 4) * 0.05,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  } else {
    gsap.set("[data-reveal]", { opacity: 1, y: 0 });
  }

  /* ---- Section heading split-word reveal ---- */
  document.querySelectorAll(".section-head h2").forEach((h2) => {
    const spans = splitHeadingWords(h2);
    if (reduceMotion) return;
    gsap.set(spans, { y: "115%" });
    gsap.to(spans, {
      y: "0%",
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.06,
      scrollTrigger: { trigger: h2, start: "top 90%", once: true }
    });
  });

  /* ---- Project image reveal (mask wipe) ---- */
  if (!reduceMotion) {
    gsap.utils.toArray(".project-image img").forEach((img) => {
      gsap.fromTo(
        img,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: { trigger: img, start: "top 85%", once: true }
        }
      );
    });
  }

  /* ---- Skill bars fill when in view ---- */
  document.querySelectorAll(".bar").forEach((bar) => {
    ScrollTrigger.create({
      trigger: bar,
      start: "top 90%",
      once: true,
      onEnter: () => bar.classList.add("in-view")
    });
  });

  /* ---- Timeline vertical fill, tied to section scroll ---- */
  const timelineFill = document.getElementById("timelineFill");
  if (timelineFill) {
    gsap.to(timelineFill, {
      height: "100%",
      ease: "none",
      scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: 0.6 }
    });
  }

  /* ---- Hero entrance ---- */
  if (!reduceMotion) {
    gsap.set(".hero-title .line span", { yPercent: 120 });
    gsap
      .timeline({ defaults: { ease: "power4.out" } })
      .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7 }, 0.15)
      .to(".hero-title .line span", { yPercent: 0, duration: 1, stagger: 0.12 }, 0.25)
      .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .to(".hero-desc", { opacity: 1, y: 0, duration: 0.8 }, 0.65)
      .to(".hero-cta", { opacity: 1, y: 0, duration: 0.8 }, 0.75)
      .to(".hero-visual", { opacity: 1, y: 0, duration: 1 }, 0.35);
  } else {
    gsap.set(".hero-visual, .hero-title .line span", { opacity: 1, y: 0, yPercent: 0 });
  }

  initScrubber();
}

/* ---- Signature element: timeline scrubber ---- */
function initScrubber() {
  const fill = document.getElementById("scrubberFill");
  const playhead = document.getElementById("scrubberPlayhead");
  const timecode = document.getElementById("scrubberTimecode");
  const fps = 24;

  function formatTimecode(progress) {
    const totalFrames = Math.floor(progress * 60 * fps);
    const ff = totalFrames % fps;
    const totalSeconds = Math.floor(totalFrames / fps);
    const ss = totalSeconds % 60;
    const mm = Math.floor(totalSeconds / 60) % 60;
    const hh = Math.floor(totalSeconds / 3600);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
  }

  function update() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight || 1;
    const progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));
    if (fill) fill.style.width = progress * 100 + "%";
    if (playhead) playhead.style.left = progress * 100 + "%";
    if (timecode) timecode.textContent = formatTimecode(progress);
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}
