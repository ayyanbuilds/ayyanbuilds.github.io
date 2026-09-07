/* =============================================================
   nav.js — compact-on-scroll floating nav + mobile menu
   ============================================================= */
export function initNav() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("lenis-stopped", open);
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("lenis-stopped");
      });
    });
  }

  // Active-section highlight
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const links = navLinks ? Array.from(navLinks.querySelectorAll("a")) : [];
  if (sections.length && links.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          links.forEach((a) => {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }
}
