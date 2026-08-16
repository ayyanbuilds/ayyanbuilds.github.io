/* =============================================================
   AYYAN SUBHANI — PORTFOLIO
   script.js
   ============================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------------------------------------
     Loader
     ----------------------------------------------------------- */
  var loader = document.getElementById("loader");
  var loaderBar = loader ? loader.querySelector(".loader-bar span") : null;
  window.addEventListener("load", function () {
    if (loaderBar) loaderBar.style.width = "100%";
    setTimeout(function () {
      if (loader) loader.classList.add("loaded");
    }, 350);
  });
  // Safety net in case 'load' never fires quickly (slow assets)
  setTimeout(function () {
    if (loaderBar) loaderBar.style.width = "100%";
    if (loader) loader.classList.add("loaded");
  }, 4000);

  /* -----------------------------------------------------------
     Year in footer
     ----------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------------------
     Mobile nav
     ----------------------------------------------------------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* -----------------------------------------------------------
     GSAP: scroll reveals + skill bars + timeline fill
     ----------------------------------------------------------- */
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger || {});

    if (!reduceMotion) {
      gsap.utils.toArray("[data-reveal]").forEach(function (el, i) {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: (i % 4) * 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true
          }
        });
      });
    } else {
      gsap.set("[data-reveal]", { opacity: 1, y: 0 });
    }

    // Skill bars fill when in view
    document.querySelectorAll(".bar").forEach(function (bar) {
      ScrollTrigger.create({
        trigger: bar,
        start: "top 90%",
        once: true,
        onEnter: function () { bar.classList.add("in-view"); }
      });
    });

    // Timeline vertical fill line, tied to section scroll
    var timelineFill = document.getElementById("timelineFill");
    if (timelineFill) {
      gsap.to(timelineFill, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline",
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.6
        }
      });
    }

    // Hero entrance
    if (!reduceMotion) {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7 }, 0.2)
        .to(".hero-title", { opacity: 1, y: 0, duration: 0.9 }, 0.32)
        .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.8 }, 0.48)
        .to(".hero-desc", { opacity: 1, y: 0, duration: 0.8 }, 0.58)
        .to(".hero-cta", { opacity: 1, y: 0, duration: 0.8 }, 0.68)
        .to(".hero-portrait", { opacity: 1, y: 0, duration: 1 }, 0.3);
    } else {
      gsap.set(".hero-portrait", { opacity: 1, y: 0 });
    }
  }

  /* -----------------------------------------------------------
     Portrait 3D tilt card
     The photo, its ring and its "available" tag sit on separate
     translateZ depths (set in CSS). Rotating the whole stack
     toward the pointer reads as genuine parallax rather than a
     flat image spinning. A pointer-tracked sheen simulates a
     glossy reflective surface, and a slow idle float keeps it
     alive at rest.
     ----------------------------------------------------------- */
  (function initPortraitTilt() {
    var portrait = document.getElementById("portrait3d");
    var heroPortraitWrap = document.querySelector(".hero-portrait");
    var frame = document.querySelector(".portrait-frame");
    var sheen = document.querySelector(".portrait-sheen");
    var edge = document.querySelector(".portrait-edge");
    if (!portrait || !heroPortraitWrap) return;

    var maxTilt = 16; // degrees
    var isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    // Entrance: settle in from a slight 3D turn rather than a flat fade
    if (window.gsap) {
      if (!reduceMotion) {
        gsap.fromTo(portrait,
          { opacity: 0, rotateY: -22, rotateX: 8, scale: 0.88 },
          { opacity: 1, rotateY: 0, rotateX: 0, scale: 1, duration: 1.3, ease: "power4.out", delay: 0.35 }
        );
        // Gentle continuous idle float so the card feels alive at rest
        gsap.to(portrait, {
          y: 10,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.6
        });
      } else {
        gsap.set(portrait, { opacity: 1, rotateY: 0, rotateX: 0, scale: 1 });
      }
    }

    if (reduceMotion || isCoarsePointer || !window.gsap) return; // skip pointer-tilt on touch / reduced motion / no GSAP

    // quickTo lets GSAP own the transform composite, so this blends
    // smoothly with the entrance and idle-float tweens above instead
    // of fighting them for control of the element's transform.
    var qRotY = gsap.quickTo(portrait, "rotateY", { duration: 0.7, ease: "power3.out" });
    var qRotX = gsap.quickTo(portrait, "rotateX", { duration: 0.7, ease: "power3.out" });

    function onMove(clientX, clientY) {
      var rect = heroPortraitWrap.getBoundingClientRect();
      var px = (clientX - rect.left) / rect.width;   // 0-1
      var py = (clientY - rect.top) / rect.height;   // 0-1
      var nx = Math.min(1, Math.max(0, px)) * 2 - 1;  // -1 to 1
      var ny = Math.min(1, Math.max(0, py)) * 2 - 1;

      qRotY(nx * maxTilt);
      qRotX(-ny * maxTilt);

      if (sheen) {
        sheen.style.setProperty("--sx", (px * 100) + "%");
        sheen.style.setProperty("--sy", (py * 100) + "%");
      }
      if (edge) {
        var angle = (Math.atan2(ny, nx) * 180 / Math.PI) + 90;
        edge.style.setProperty("--edge-angle", angle + "deg");
      }
    }

    window.addEventListener("mousemove", function (e) {
      onMove(e.clientX, e.clientY);
    }, { passive: true });
  })();

  /* -----------------------------------------------------------
     Signature element: timeline scrubber (scroll progress bar
     styled like a video editor's timecode readout)
     ----------------------------------------------------------- */
  var scrubberFill = document.getElementById("scrubberFill");
  var scrubberPlayhead = document.getElementById("scrubberPlayhead");
  var scrubberTimecode = document.getElementById("scrubberTimecode");
  var fps = 24;

  function formatTimecode(progress) {
    // Map scroll progress (0-1) to a friendly HH:MM:SS:FF style readout
    var totalFrames = Math.floor(progress * 60 * fps); // treat full page as a "60s" reel
    var ff = totalFrames % fps;
    var totalSeconds = Math.floor(totalFrames / fps);
    var ss = totalSeconds % 60;
    var mm = Math.floor(totalSeconds / 60) % 60;
    var hh = Math.floor(totalSeconds / 3600);
    function pad(n) { return String(n).padStart(2, "0"); }
    return pad(hh) + ":" + pad(mm) + ":" + pad(ss) + ":" + pad(ff);
  }

  function updateScrubber() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = (doc.scrollHeight - doc.clientHeight) || 1;
    var progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));

    if (scrubberFill) scrubberFill.style.width = (progress * 100) + "%";
    if (scrubberPlayhead) scrubberPlayhead.style.left = (progress * 100) + "%";
    if (scrubberTimecode) scrubberTimecode.textContent = formatTimecode(progress);
  }

  var scrubberTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrubberTicking) {
      window.requestAnimationFrame(function () {
        updateScrubber();
        scrubberTicking = false;
      });
      scrubberTicking = true;
    }
  }, { passive: true });
  updateScrubber();

  /* -----------------------------------------------------------
     Contact form (front-end demo only — see README to wire up
     a real endpoint such as Formspree / EmailJS)
     ----------------------------------------------------------- */

  /* -----------------------------------------------------------
     THREE.JS — interactive hero object
     A wireframe icosahedron core (dev "geometry") wrapped with a
     second rotating shell of thin rings (film "frame" motif),
     drawn in the amber / cyan signature palette. Responds smoothly
     to pointer position via lerped rotation targets.
     ----------------------------------------------------------- */
  var canvas = document.getElementById("hero-canvas");
  var fallbackVideo = document.getElementById("hero-fallback-video");

  function showFallback() {
    if (canvas) canvas.style.display = "none";
    if (fallbackVideo) {
      fallbackVideo.classList.add("active");
      var playPromise = fallbackVideo.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
    }
  }

  function supportsWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  if (!canvas || !window.THREE || !supportsWebGL()) {
    showFallback();
  } else {
    try {
      initHero3D(canvas);
    } catch (err) {
      console.warn("Hero 3D failed to initialize, using fallback visual.", err);
      showFallback();
    }
  }

  function initHero3D(canvas) {
    var heroSection = document.getElementById("hero");
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(
      45,
      heroSection.clientWidth / heroSection.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);

    // ---- Object group ----
    var group = new THREE.Group();
    scene.add(group);

    var amber = 0xe8b627;
    var cyan = 0x37e0d8;

    // Core: wireframe icosahedron ("code" geometry)
    var coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
    var coreMat = new THREE.MeshBasicMaterial({
      color: amber,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    var core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Inner solid faint fill for depth
    var fillMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.35
    });
    var fillMesh = new THREE.Mesh(coreGeo.clone(), fillMat);
    fillMesh.scale.setScalar(0.985);
    group.add(fillMesh);

    // Outer rings ("film frame" motif) — three tilted torus rings
    var ringGeo = new THREE.TorusGeometry(3.05, 0.012, 16, 100);
    var ringMat = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.55 });
    var rings = [];
    var tilts = [
      { x: Math.PI / 2.1, y: 0, z: 0 },
      { x: Math.PI / 2.6, y: Math.PI / 3, z: 0 },
      { x: Math.PI / 2.4, y: -Math.PI / 3.4, z: 0 }
    ];
    tilts.forEach(function (t) {
      var ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.rotation.set(t.x, t.y, t.z);
      group.add(ring);
      rings.push(ring);
    });

    // Particle field (ambient depth)
    var particleCount = window.innerWidth < 720 ? 120 : 320;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.028,
      transparent: true,
      opacity: 0.35
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Position the whole group to the right side, near the portrait
    function layoutGroup() {
      var isNarrow = window.innerWidth <= 980;
      group.position.set(isNarrow ? 0 : 2.6, isNarrow ? 1.4 : 0, 0);
      var scale = isNarrow ? 0.72 : 1;
      group.scale.setScalar(scale);
    }
    layoutGroup();

    // ---- Pointer interaction (smoothed / lerped) ----
    var pointer = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };

    function onPointerMove(clientX, clientY) {
      var rect = heroSection.getBoundingClientRect();
      target.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((clientY - rect.top) / rect.height) * 2 - 1;
    }
    window.addEventListener("mousemove", function (e) {
      onPointerMove(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (e.touches && e.touches[0]) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // ---- Resize ----
    function onResize() {
      var w = heroSection.clientWidth;
      var h = heroSection.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      layoutGroup();
    }
    window.addEventListener("resize", onResize);

    // ---- Visibility: pause the render loop off-screen for perf ----
    var isVisible = true;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      io.observe(heroSection);
    }

    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      var delta = clock.getDelta();
      var elapsed = clock.getElapsedTime();

      // Smooth lerp toward pointer target
      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;

      var autoSpin = reduceMotion ? 0 : elapsed * 0.06;

      group.rotation.y = autoSpin + pointer.x * 0.5;
      group.rotation.x = pointer.y * -0.35;
      core.rotation.y += reduceMotion ? 0 : delta * 0.12;
      fillMesh.rotation.copy(core.rotation);

      rings.forEach(function (ring, idx) {
        ring.rotation.z += (reduceMotion ? 0 : delta * (0.08 + idx * 0.03));
      });

      if (!reduceMotion) {
        particles.rotation.y += delta * 0.01;
      }

      renderer.render(scene, camera);
    }
    animate();
  }
})();
