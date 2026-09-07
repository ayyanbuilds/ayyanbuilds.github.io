/* =============================================================
   hero3d.js — cinematic Three.js hero scene + the portrait's
   pointer-tracked 3D tilt card.

   Scene: a wireframe icosahedron core ("code" geometry), three
   tilted rings (film-frame motif), a flat rounded "browser
   window" panel (abstract floating UI), and an ambient particle
   field — all in the amber/cyan signature palette. Falls back
   to a poster/video if WebGL or Three.js is unavailable.
   ============================================================= */
import { reduceMotion, isCoarsePointer } from "./utils.js";

export function initHero3D() {
  const canvas = document.getElementById("hero-canvas");
  const fallbackVideo = document.getElementById("hero-fallback-video");

  function showFallback() {
    if (canvas) canvas.style.display = "none";
    if (fallbackVideo) {
      fallbackVideo.classList.add("active");
      const p = fallbackVideo.play();
      if (p && p.catch) p.catch(() => {});
    }
  }

  function supportsWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  if (!canvas || !window.THREE || !supportsWebGL()) {
    showFallback();
  } else {
    try {
      buildScene(canvas);
    } catch (err) {
      console.warn("Hero 3D failed to initialize, using fallback visual.", err);
      showFallback();
    }
  }

  initPortraitTilt();
}

function buildScene(canvas) {
  const heroSection = document.getElementById("hero");
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, heroSection.clientWidth / heroSection.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);

  const group = new THREE.Group();
  scene.add(group);

  const amber = 0xe8b627;
  const cyan = 0x37e0d8;

  // Core: wireframe icosahedron
  const coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: amber, wireframe: true, transparent: true, opacity: 0.5 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const fillMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.32 });
  const fillMesh = new THREE.Mesh(coreGeo.clone(), fillMat);
  fillMesh.scale.setScalar(0.985);
  group.add(fillMesh);

  // Outer rings ("film frame" motif)
  const ringGeo = new THREE.TorusGeometry(3.05, 0.012, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.5 });
  const rings = [];
  [
    { x: Math.PI / 2.1, y: 0, z: 0 },
    { x: Math.PI / 2.6, y: Math.PI / 3, z: 0 },
    { x: Math.PI / 2.4, y: -Math.PI / 3.4, z: 0 }
  ].forEach((t) => {
    const ring = new THREE.Mesh(ringGeo, ringMat.clone());
    ring.rotation.set(t.x, t.y, t.z);
    group.add(ring);
    rings.push(ring);
  });

  // Floating "browser window" panel — an abstract nod to a UI surface,
  // built from primitives rather than a texture so it stays crisp and light.
  const windowGroup = new THREE.Group();
  const panelGeo = new THREE.PlaneGeometry(2.6, 1.6);
  const panelMat = new THREE.MeshBasicMaterial({ color: 0x0d0d10, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  windowGroup.add(panel);

  const panelEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(panelGeo),
    new THREE.LineBasicMaterial({ color: amber, transparent: true, opacity: 0.45 })
  );
  windowGroup.add(panelEdges);

  const barGeo = new THREE.PlaneGeometry(2.6, 0.22);
  const barMat = new THREE.MeshBasicMaterial({ color: 0x17171d, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(0, 0.69, 0.01);
  windowGroup.add(bar);

  const dotGeo = new THREE.CircleGeometry(0.03, 16);
  [-1.12, -1.0, -0.88].forEach((x, i) => {
    const dotMat = new THREE.MeshBasicMaterial({ color: i === 0 ? cyan : 0x3a3a42 });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.set(x, 0.69, 0.02);
    windowGroup.add(dotMesh);
  });

  const lineGeo = new THREE.PlaneGeometry(1.6, 0.05);
  [0.28, 0.05, -0.18].forEach((y, i) => {
    const lineMat = new THREE.MeshBasicMaterial({ color: i === 0 ? amber : 0x3a3a42, transparent: true, opacity: 0.5 });
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    lineMesh.scale.x = 1 - i * 0.22;
    lineMesh.position.set(-0.4 * i, y, 0.01);
    windowGroup.add(lineMesh);
  });

  windowGroup.position.set(-2.4, -1.1, -1.4);
  windowGroup.rotation.set(0.12, 0.5, -0.04);
  windowGroup.scale.setScalar(0.9);
  group.add(windowGroup);

  // Ambient particle field
  const particleCount = window.innerWidth < 720 ? 110 : 300;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0.32 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  function layoutGroup() {
    const isNarrow = window.innerWidth <= 980;
    group.position.set(isNarrow ? 0 : 2.6, isNarrow ? 1.4 : 0, 0);
    group.scale.setScalar(isNarrow ? 0.72 : 1);
  }
  layoutGroup();

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  function onPointerMove(clientX, clientY) {
    const rect = heroSection.getBoundingClientRect();
    target.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    target.y = ((clientY - rect.top) / rect.height) * 2 - 1;
  }
  window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  function onResize() {
    const w = heroSection.clientWidth;
    const h = heroSection.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    layoutGroup();
  }
  window.addEventListener("resize", onResize);

  let isVisible = true;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => (isVisible = entries[0].isIntersecting), { threshold: 0.05 });
    io.observe(heroSection);
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;

    const autoSpin = reduceMotion ? 0 : elapsed * 0.06;

    group.rotation.y = autoSpin + pointer.x * 0.5;
    group.rotation.x = pointer.y * -0.35;
    core.rotation.y += reduceMotion ? 0 : delta * 0.12;
    fillMesh.rotation.copy(core.rotation);

    rings.forEach((ring, idx) => {
      ring.rotation.z += reduceMotion ? 0 : delta * (0.08 + idx * 0.03);
    });

    windowGroup.position.y = -1.1 + Math.sin(elapsed * 0.5) * (reduceMotion ? 0 : 0.08);
    windowGroup.rotation.y = 0.5 + pointer.x * 0.15;

    if (!reduceMotion) particles.rotation.y += delta * 0.01;

    renderer.render(scene, camera);
  }
  animate();
}

/* ---- Portrait 3D tilt card ---- */
function initPortraitTilt() {
  const portrait = document.getElementById("portrait3d");
  const heroVisual = document.querySelector(".hero-visual");
  const sheen = document.querySelector(".portrait-sheen");
  const edge = document.querySelector(".portrait-edge");
  if (!portrait || !heroVisual) return;

  const maxTilt = 14;

  if (window.gsap) {
    if (!reduceMotion) {
      gsap.fromTo(
        portrait,
        { opacity: 0, rotateY: -22, rotateX: 8, scale: 0.88 },
        { opacity: 1, rotateY: 0, rotateX: 0, scale: 1, duration: 1.3, ease: "power4.out", delay: 0.45 }
      );
      gsap.to(portrait, { y: 10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.7 });
    } else {
      gsap.set(portrait, { opacity: 1, rotateY: 0, rotateX: 0, scale: 1 });
    }
  }

  if (reduceMotion || isCoarsePointer || !window.gsap) return;

  const qRotY = gsap.quickTo(portrait, "rotateY", { duration: 0.7, ease: "power3.out" });
  const qRotX = gsap.quickTo(portrait, "rotateX", { duration: 0.7, ease: "power3.out" });

  function onMove(clientX, clientY) {
    const rect = heroVisual.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const nx = Math.min(1, Math.max(0, px)) * 2 - 1;
    const ny = Math.min(1, Math.max(0, py)) * 2 - 1;

    qRotY(nx * maxTilt);
    qRotX(-ny * maxTilt);

    if (sheen) {
      sheen.style.setProperty("--sx", px * 100 + "%");
      sheen.style.setProperty("--sy", py * 100 + "%");
    }
    if (edge) {
      const angle = (Math.atan2(ny, nx) * 180) / Math.PI + 90;
      edge.style.setProperty("--edge-angle", angle + "deg");
    }
  }

  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
}
