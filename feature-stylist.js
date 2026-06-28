(function initStylistBoard() {
  const board = document.getElementById("stylistBoard");
  if (!board) return;

  const pieces = [...board.querySelectorAll(".collage-piece")];
  let dragPiece = null;
  let dragOffset = { x: 0, y: 0 };

  function bringToFront(piece) {
    const maxZ = Math.max(...pieces.map((p) => parseInt(p.style.getPropertyValue("--z"), 10) || 1));
    piece.style.setProperty("--z", String(maxZ + 1));
  }

  function pointerPos(e, piece) {
    const rect = board.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return {
      x: ((clientX - rect.left - dragOffset.x) / rect.width) * 100,
      y: ((clientY - rect.top - dragOffset.y) / rect.height) * 100,
      pieceW: (pieceRect.width / rect.width) * 100,
      pieceH: (pieceRect.height / rect.height) * 100,
    };
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function startDrag(e, piece) {
    if (e.button !== undefined && e.button !== 0) return;
    bringToFront(piece);
    dragPiece = piece;
    piece.classList.add("is-dragging");
    const rect = piece.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    dragOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    e.preventDefault();
  }

  function moveDrag(e) {
    if (!dragPiece) return;
    const pos = pointerPos(e, dragPiece);
    const x = clamp(pos.x, -5, 100 - pos.pieceW + 5);
    const y = clamp(pos.y, -5, 100 - pos.pieceH + 5);
    dragPiece.style.setProperty("--x", `${x}%`);
    dragPiece.style.setProperty("--y", `${y}%`);
  }

  function endDrag() {
    if (!dragPiece) return;
    dragPiece.classList.remove("is-dragging");
    dragPiece = null;
  }

  pieces.forEach((piece) => {
    piece.addEventListener("pointerdown", (e) => startDrag(e, piece));
  });

  board.addEventListener("pointermove", moveDrag);
  board.addEventListener("pointerup", endDrag);
  board.addEventListener("pointercancel", endDrag);
  board.addEventListener("pointerleave", endDrag);
})();

(function initSummerGlitter() {
  const btn = document.getElementById("glitterToggle");
  const overlay = document.getElementById("summerGlitter");
  if (!btn || !overlay || !document.body.classList.contains("page-summer-pop")) return;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildSparkles() {
    const frag = document.createDocumentFragment();
    const area = window.innerWidth * window.innerHeight;
    const starCount = Math.floor(Math.min(320, Math.max(160, area / 2800)));
    const dustCount = Math.floor(Math.min(420, Math.max(220, area / 2200)));

    for (let i = 0; i < starCount; i += 1) {
      const spark = document.createElement("span");
      spark.className = "summer-glitter-spark";
      spark.style.setProperty("--gx", `${rand(0, 100)}%`);
      spark.style.setProperty("--gy", `${rand(0, 100)}%`);
      spark.style.setProperty("--gw", `${rand(5, 11)}px`);
      spark.style.setProperty("--gs", `${rand(0.45, 1.35)}`);
      spark.style.setProperty("--gdelay", `${rand(0, 0.35)}s`);
      spark.style.setProperty("--gdur", `${rand(0.45, 0.9)}s`);
      frag.appendChild(spark);
    }

    for (let i = 0; i < dustCount; i += 1) {
      const dust = document.createElement("span");
      dust.className = "summer-glitter-dust";
      dust.style.setProperty("--gx", `${rand(0, 100)}%`);
      dust.style.setProperty("--gy", `${rand(0, 100)}%`);
      dust.style.setProperty("--gw", `${rand(2, 5)}px`);
      dust.style.setProperty("--gdelay", `${rand(0, 0.35)}s`);
      dust.style.setProperty("--gdur", `${rand(0.4, 0.85)}s`);
      frag.appendChild(dust);
    }

    overlay.replaceChildren(frag);
  }

  function applyGlitter(on) {
    if (on && !overlay.childElementCount) buildSparkles();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "No glitter" : "Glitter";
    document.body.classList.toggle("page-glitter", on);
    overlay.setAttribute("aria-hidden", on ? "false" : "true");
    queueMicrotask(() => {
      try { localStorage.setItem("hammer_summer_glitter", on ? "1" : "0"); } catch (e) {}
    });
  }

  btn.addEventListener("click", () => {
    applyGlitter(!document.body.classList.contains("page-glitter"));
  });

  const savedOn = (() => {
    try { return localStorage.getItem("hammer_summer_glitter") === "1"; }
    catch (e) { return false; }
  })();

  if (savedOn) buildSparkles();
  else if (typeof scheduleIdle === "function") scheduleIdle(buildSparkles);
  else buildSparkles();

  applyGlitter(savedOn);

  window.addEventListener("resize", debounce(() => {
    if (document.body.classList.contains("page-glitter") || overlay.childElementCount) buildSparkles();
  }, 200));
})();

(function initPolkaBurst() {
  const overlay = document.getElementById("polkaBurst");
  const svg = overlay?.querySelector(".polka-burst-svg");
  if (!overlay || !svg || !document.body.classList.contains("page-summer-pop")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const CYCLE_MS = 30000;
  const BURST_MS = 1500;
  let cycleTimer = null;
  let clearTimer = null;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function dotFill() {
    return document.body.classList.contains("heated") ? "#ffffff" : "#00ffff";
  }

  function clearDots() {
    svg.querySelectorAll("circle").forEach((node) => node.remove());
  }

  function buildBurst() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const fill = dotFill();

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    clearDots();

    const count = Math.floor(rand(22, Math.min(42, (w * h) / 18000)));

    for (let i = 0; i < count; i += 1) {
      const circle = document.createElementNS(SVG_NS, "circle");
      const r = rand(6, 20);
      circle.setAttribute("cx", String(rand(-r, w + r)));
      circle.setAttribute("cy", String(rand(-r, h + r)));
      circle.setAttribute("r", String(r));
      circle.setAttribute("fill", fill);
      circle.style.setProperty("--polka-delay", `${rand(0, 0.3)}s`);
      circle.style.setProperty("--polka-dur", `${rand(0.95, 1.35)}s`);
      svg.appendChild(circle);
    }

    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(clearDots, BURST_MS);
  }

  function startCycle() {
    if (cycleTimer) return;
    buildBurst();
    cycleTimer = window.setInterval(buildBurst, CYCLE_MS);
  }

  function stopCycle() {
    window.clearInterval(cycleTimer);
    window.clearTimeout(clearTimer);
    cycleTimer = null;
    clearTimer = null;
    clearDots();
  }

  window.setTimeout(startCycle, 800);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCycle();
    else startCycle();
  });

  document.getElementById("modeToggle")?.addEventListener("click", () => {
    if (!document.hidden) buildBurst();
  });
})();
