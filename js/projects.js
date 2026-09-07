/* =============================================================
   projects.js — project card -> full-screen case-study overlay
   ============================================================= */
import { reduceMotion } from "./utils.js";

export function initProjects() {
  const overlay = document.getElementById("projectOverlay");
  const closeBtn = document.getElementById("overlayClose");
  if (!overlay) return;

  const els = {
    image: document.getElementById("overlayImage"),
    category: document.getElementById("overlayCategory"),
    title: document.getElementById("overlayTitle"),
    desc: document.getElementById("overlayDesc"),
    tags: document.getElementById("overlayTags"),
    live: document.getElementById("overlayLive"),
    github: document.getElementById("overlayGithub")
  };

  let lastFocused = null;

  function open(card) {
    els.image.src = card.dataset.image || "";
    els.image.alt = card.dataset.title || "";
    els.category.textContent = card.dataset.category || "";
    els.title.textContent = card.dataset.title || "";
    els.desc.textContent = card.dataset.desc || "";
    els.tags.textContent = (card.dataset.tags || "").split(",").join(" · ");
    els.live.href = card.dataset.live || "#";
    els.github.href = card.dataset.github || "#";

    lastFocused = document.activeElement;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("lenis-stopped");

    if (window.gsap && !reduceMotion) {
      gsap.fromTo(
        overlay,
        { clipPath: "circle(4% at 90% 10%)" },
        { clipPath: "circle(150% at 90% 10%)", duration: 0.9, ease: "power4.inOut" }
      );
    } else {
      overlay.style.clipPath = "none";
    }
    overlay.scrollTo({ top: 0 });
    closeBtn.focus();
  }

  function close() {
    document.body.classList.remove("lenis-stopped");
    if (window.gsap && !reduceMotion) {
      gsap.to(overlay, {
        clipPath: "circle(4% at 90% 10%)",
        duration: 0.7,
        ease: "power3.inOut",
        onComplete: () => {
          overlay.classList.remove("is-open");
          overlay.setAttribute("aria-hidden", "true");
        }
      });
    } else {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-project]").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't intercept the card's own live/GitHub links.
      if (e.target.closest("a")) return;
      open(card);
    });
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
