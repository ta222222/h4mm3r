/* heated mode */
const modeToggle = document.getElementById("modeToggle");
const datetimeEl = document.getElementById("datetime");

function debounce(fn, ms = 120) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function rafThrottle(fn) {
  let scheduled = false;
  return (...args) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn(...args);
    });
  };
}

const scheduleIdle = typeof requestIdleCallback === "function"
  ? (cb) => requestIdleCallback(cb, { timeout: 1500 })
  : (cb) => setTimeout(cb, 1);

(function initPerf() {
  const skipLazy = ".intro-splash, .intro-flash, .site-header, .hero, .tv-player, .tv-player-poster, .tv-float-modal-stage video";
  document.querySelectorAll("img:not([loading])").forEach((img) => {
    if (img.closest(skipLazy)) {
      if (!img.getAttribute("fetchpriority")) img.fetchPriority = "high";
      if (!img.decoding) img.decoding = "async";
      return;
    }
    img.loading = "lazy";
    if (!img.decoding) img.decoding = "async";
  });
})();

function applyMode(mode) {
  const heated = mode === "heated";
  document.body.classList.toggle("heated", heated);
  document.body.classList.toggle("normal", !heated);
  if (modeToggle) {
    const isSummerPop = document.body.classList.contains("page-summer-pop");
    const isInfluencers = document.body.classList.contains("page-influencers");
    if (isSummerPop) {
      modeToggle.textContent = heated ? "Pop" : "Cool";
    } else if (isInfluencers) {
      modeToggle.textContent = heated ? "Dark" : "Light";
    } else {
      modeToggle.textContent = heated ? "Cool" : "Heat";
    }
  }
  try { localStorage.setItem("hammer_online_mode", mode); } catch (e) {}
}

function applyInfluencersTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  document.body.classList.remove("heated");
  document.body.classList.add("normal");
  if (modeToggle) {
    modeToggle.textContent = isLight ? "Dark" : "Light";
  }
  try { localStorage.setItem("hammer_influencers_theme", theme); } catch (e) {}
}

(function initPageMode() {
  if (document.body.classList.contains("page-archiving")) {
    applyMode("normal");
    return;
  }
  if (document.body.classList.contains("page-influencers")) {
    const saved = (() => {
      try { return localStorage.getItem("hammer_influencers_theme"); }
      catch (e) { return null; }
    })();
    applyInfluencersTheme(saved === "light" ? "light" : "dark");
    return;
  }
  applyMode((() => {
    try { return localStorage.getItem("hammer_online_mode"); }
    catch (e) { return null; }
  })() === "heated" ? "heated" : "normal");
})();

modeToggle?.addEventListener("click", () => {
  if (document.body.classList.contains("page-influencers")) {
    applyInfluencersTheme(document.body.classList.contains("theme-light") ? "dark" : "light");
    return;
  }
  applyMode(document.body.classList.contains("heated") ? "normal" : "heated");
});

/* features page — intro photo cycle (logo click) */
(function introMontage() {
  const splash = document.getElementById("introSplash");
  const slide = document.getElementById("introSlide");
  const logo = document.querySelector(".site-header .logo");
  if (!splash || !slide) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    splash.remove();
    showNavLogo();
    return;
  }

  function showNavLogo() {
    document.body.classList.add("nav-logo-visible");
    showHeroMagicHint();
  }

  function showHeroMagicHint() {
    const hint = document.getElementById("heroMagicHint");
    const textEl = document.getElementById("heroMagicHintText");
    const dotsEl = document.getElementById("heroMagicHintDots");
    if (!hint || !textEl || !dotsEl || !window.matchMedia("(min-width: 769px)").matches) return;

    const baseText = "The fun happens below";
    const dotsPatterns = [".", "..", "...", ""];
    let typeTimer = null;
    let dotsTimer = null;

    function clearHintTimers() {
      clearTimeout(typeTimer);
      clearTimeout(dotsTimer);
    }

    function startDotsLoop() {
      let step = 0;
      function tick() {
        dotsEl.textContent = dotsPatterns[step];
        step = (step + 1) % dotsPatterns.length;
        dotsTimer = setTimeout(tick, 420);
      }
      tick();
    }

    clearHintTimers();
    textEl.textContent = "";
    dotsEl.textContent = "";
    hint.hidden = false;
    hint.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => hint.classList.add("is-visible"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      textEl.textContent = baseText;
      startDotsLoop();
      return;
    }

    let index = 0;
    function typeNextChar() {
      if (index < baseText.length) {
        textEl.textContent += baseText.charAt(index);
        index += 1;
        typeTimer = setTimeout(typeNextChar, 48);
        return;
      }
      startDotsLoop();
    }

    typeNextChar();
  }

  function hideNavLogo() {
    document.body.classList.remove("nav-logo-visible");
  }

  const pix = "https://raw.githubusercontent.com/ta222222/hammer/refs/heads/main/pix/";
  /* Photos already used in page sections (hero, grid, articles, strips, TV) — excluded from montage */
  const sectionUsed = new Set([
    "560.jpg", "DSCN3201.webp", "DSCN4206.webp", "DSCN4207.webp", "DSCN4523.webp",
    "DSCN4925.webp", "DSCN1671.webp", "hammer preview launch red.webp",
    "josh gordon hammer.webp", "mickeyvintage.webp", "RIMG0034-1.webp", "RIMG0056.webp",
    "RIMG0138.webp", "RIMG0152.webp", "RIMG0172.webp", "RIMG0227.webp", "RIMG0299.webp",
    "RIMG0344.webp", "RIMG0363.webp", "RIMG0512.webp", "RIMG0593.webp", "RIMG0669.webp",
    "RIMG0708.webp", "RIMG0749.webp", "RIMG0758.webp", "RIMG0772.webp", "RIMG0802.webp",
    "RIMG0939.webp", "RIMG0945.webp", "RIMG1024.webp", "RIMG1116.webp", "RIMG1176.webp",
    "RIMG1242.webp", "RIMG1578.webp",
  ]);
  const pool = [
    "RIMG0457.webp", "DSCN4720.JPG", "RIMG0011.webp", "RIMG0278.webp", "RIMG0077.webp",
    "DSCN4383.webp", "RIMG0399.webp", "DSCN1650.JPG", "RIMG0715.JPG", "IMG_2747.jpg",
  ].filter((file) => !sectionUsed.has(file));

  const MONTAGE_EXIT_MS = 150;
  const MONTAGE_CROSSFADE_MS = 100;
  const MONTAGE_MS_PER_PHOTO = 200;
  const MONTAGE_LOGO_MS = 450;
  const MONTAGE_LOGO_BLINK_ON_MS = 90;
  const FLASH_BLINK_CYCLES = 1;
  const FLASH_BLINK_ON_MS = 100;
  const FLASH_BLINK_OFF_MS = 100;
  const FLASH_FINAL_HOLD_MS = 150;
  const HERMES_FLASH_URL =
    "https://raw.githubusercontent.com/ta222222/hammer/refs/heads/main/pix/hermes-bag.jpeg";

  let endTimer = null;
  let stepTimers = [];
  let playing = false;
  let flashAfterMontage = false;

  function clearMontageTimers() {
    stepTimers.forEach((id) => clearTimeout(id));
    stepTimers = [];
    clearTimeout(endTimer);
  }

  document.documentElement.style.setProperty(
    "--intro-crossfade-ms",
    `${MONTAGE_CROSSFADE_MS}ms`
  );
  document.documentElement.style.setProperty(
    "--intro-exit-ms",
    `${MONTAGE_EXIT_MS}ms`
  );

  const carousel = slide.parentElement;
  const introLogo = splash.querySelector(".intro-logo");
  let frontEl = slide;
  let backEl = slide.cloneNode(false);
  backEl.removeAttribute("id");
  backEl.className = "intro-slide";
  backEl.decoding = "async";
  carousel.appendChild(backEl);

  function preloadUrls(urls) {
    return Promise.all(
      urls.map((url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = async () => {
            try { await img.decode(); } catch (e) {}
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        })
      )
    );
  }

  function shuffledUrls() {
    const shuffled = pool.slice();
    for (let n = shuffled.length - 1; n > 0; n--) {
      const r = Math.floor(Math.random() * (n + 1));
      [shuffled[n], shuffled[r]] = [shuffled[r], shuffled[n]];
    }
    return shuffled.map((p) => pix + p);
  }

  function delay(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      stepTimers.push(id);
    });
  }

  function finishMontage() {
    splash.classList.remove("is-playing", "is-done", "is-logo-beat", "is-photo-montage");
    introLogo?.classList.remove("is-off");
    playing = false;
    if (flashAfterMontage) {
      flashAfterMontage = false;
      playHermesFlash(showNavLogo);
      return;
    }
    showNavLogo();
  }

  function playHermesFlash(done) {
    const flash = document.getElementById("introFlash");
    const img = flash?.querySelector("img");
    const frame = flash?.querySelector(".intro-flash-frame");
    if (!flash || !img) {
      done?.();
      return;
    }

    function hideFlash() {
      flash.classList.remove("is-active", "is-blinking");
      flash.hidden = true;
      flash.setAttribute("aria-hidden", "true");
      frame?.classList.remove("is-off");
      document.body.classList.remove("intro-active");
      done?.();
    }

    function exitFlash(delay) {
      const fadeId = setTimeout(() => {
        flash.classList.remove("is-active");
        const hideId = setTimeout(hideFlash, MONTAGE_EXIT_MS);
        stepTimers.push(hideId);
      }, delay);
      stepTimers.push(fadeId);
    }

    function runBlinkSequence() {
      if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        frame?.classList.remove("is-off");
        exitFlash(FLASH_FINAL_HOLD_MS);
        return;
      }

      let cyclesLeft = FLASH_BLINK_CYCLES;
      frame.classList.remove("is-off");
      flash.classList.add("is-blinking");

      function blinkOff() {
        frame.classList.add("is-off");
        stepTimers.push(setTimeout(blinkOn, FLASH_BLINK_OFF_MS));
      }

      function blinkOn() {
        frame.classList.remove("is-off");
        cyclesLeft--;
        if (cyclesLeft <= 0) {
          exitFlash(FLASH_FINAL_HOLD_MS);
          return;
        }
        stepTimers.push(setTimeout(blinkOff, FLASH_BLINK_ON_MS));
      }

      stepTimers.push(setTimeout(blinkOff, FLASH_BLINK_ON_MS));
    }

    function revealFlash() {
      document.body.classList.add("intro-active");
      flash.hidden = false;
      flash.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        flash.classList.add("is-active");
        runBlinkSequence();
      });
    }

    function whenImageReady(cb) {
      if (img.complete && img.naturalWidth > 0) {
        img.decode().then(cb).catch(cb);
        return;
      }
      img.addEventListener("load", () => {
        img.decode().then(cb).catch(cb);
      }, { once: true });
      img.addEventListener("error", () => done?.(), { once: true });
    }

    whenImageReady(revealFlash);
  }

  function pulseMontageLogo() {
    if (!introLogo || !playing) return;
    introLogo.classList.remove("is-off");
    const offId = setTimeout(() => {
      if (!playing) return;
      introLogo.classList.add("is-off");
    }, MONTAGE_LOGO_BLINK_ON_MS);
    stepTimers.push(offId);
  }

  function playMontage({ flashAfter = false } = {}) {
    if (playing) return;
    flashAfterMontage = flashAfter;
    if (!pool.length) {
      if (flashAfterMontage) {
        flashAfterMontage = false;
        preloadUrls([HERMES_FLASH_URL]).then(() => playHermesFlash(showNavLogo));
      } else {
        showNavLogo();
      }
      return;
    }
    playing = true;

    clearMontageTimers();
    hideNavLogo();

    const urls = shuffledUrls();
    const photoCount = urls.length;
    const playMs = photoCount * MONTAGE_MS_PER_PHOTO;
    const preloadList = flashAfterMontage ? urls.concat(HERMES_FLASH_URL) : urls;

    splash.classList.remove("is-done");
    splash.classList.add("is-playing", "is-logo-beat");
    document.body.classList.add("intro-active");

    frontEl.classList.remove("is-front");
    backEl.classList.remove("is-front");

    Promise.all([preloadUrls(preloadList), delay(MONTAGE_LOGO_MS)]).then(() => {
      if (!playing) return;

      splash.classList.remove("is-logo-beat");
      splash.classList.add("is-photo-montage");
      frontEl.src = urls[0];
      frontEl.classList.add("is-front");
      pulseMontageLogo();

      for (let step = 1; step < photoCount; step++) {
        const id = setTimeout(() => {
          if (!playing) return;
          const url = urls[step];
          backEl.src = url;
          backEl.classList.add("is-front");
          frontEl.classList.remove("is-front");
          [frontEl, backEl] = [backEl, frontEl];
          pulseMontageLogo();
        }, step * MONTAGE_MS_PER_PHOTO);
        stepTimers.push(id);
      }

      endTimer = setTimeout(() => {
        splash.classList.add("is-done");
        document.body.classList.remove("intro-active");
        const doneId = setTimeout(finishMontage, MONTAGE_EXIT_MS);
        stepTimers.push(doneId);
      }, playMs);
    });
  }

  function isInternalSectionNav() {
    try {
      const ref = document.referrer;
      if (!ref) return false;
      return new URL(ref).origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function shouldAutoPlayMontage() {
    const nav = performance.getEntriesByType("navigation")[0];
    const type = nav?.type;
    if (type === "reload") return true;
    if (type === "navigate" && !isInternalSectionNav()) return true;
    return false;
  }

  logo?.addEventListener("click", (e) => {
    e.preventDefault();
    logo.classList.add("is-pressed");
    playMontage();
    setTimeout(() => logo.classList.remove("is-pressed"), 120);
  });

  try {
    if (sessionStorage.getItem("hammer_reel") === "1") {
      sessionStorage.removeItem("hammer_reel");
      playMontage({ flashAfter: true });
      return;
    }
  } catch (e) {}

  if (shouldAutoPlayMontage()) playMontage({ flashAfter: true });
  else showNavLogo();
})();

/* logo — press + hover feedback on all pages */
(function initLogo() {
  const logo = document.querySelector(".site-header .logo");
  if (!logo) return;

  const release = () => logo.classList.remove("is-pressed");

  logo.addEventListener("pointerdown", () => logo.classList.add("is-pressed"), { passive: true });
  logo.addEventListener("pointerup", release);
  logo.addEventListener("pointercancel", release);
  logo.addEventListener("mouseleave", release);
})();

/* logo on other pages — flag montage for features home */
(function logoReelNav() {
  if (document.getElementById("introSplash")) return;
  document.querySelector(".site-header .logo")?.addEventListener("click", () => {
    try { sessionStorage.setItem("hammer_reel", "1"); } catch (e) {}
  });
})();

/* bottom marquee — fill bar, loop from full text start */
(function initMarquee() {
  const tracks = document.querySelectorAll(".marquee-track");
  if (!tracks.length) return;

  function build(track) {
    const text = track.querySelector("span")?.textContent?.trim();
    if (!text) return;

    track.textContent = "";
    track.style.removeProperty("--marquee-shift");

    const add = () => {
      const s = document.createElement("span");
      s.textContent = text;
      track.appendChild(s);
    };

    add();
    while (track.scrollWidth < window.innerWidth) add();

    [...track.children].forEach((span) => {
      const clone = span.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    track.style.setProperty("--marquee-shift", `-${track.scrollWidth / 2}px`);
  }

  function rebuildAll() {
    tracks.forEach(build);
  }

  scheduleIdle(rebuildAll);
  window.addEventListener("resize", debounce(rebuildAll, 150));

  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    tracks.forEach((track) => {
      track.style.animation = "none";
      void track.offsetWidth;
      track.style.animation = "";
    });
  });
})();

/* bottom banners — marquee + subscribe, only at page bottom */
(function initBottomBanners() {
  const marquee = document.querySelector(".marquee-wrap");
  const subscribeFoot = document.querySelector(".tv-subscribe-foot");
  if (!marquee && !subscribeFoot) return;

  if (subscribeFoot) document.body.classList.add("has-bottom-subscribe");

  let sentinel = document.querySelector(".bottom-banner-sentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.className = "bottom-banner-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    if (marquee) document.body.insertBefore(sentinel, marquee);
    else document.body.appendChild(sentinel);
  }

  function setVisible(show) {
    marquee?.classList.toggle("is-visible", show);
    subscribeFoot?.classList.toggle("is-visible", show);
  }

  function atPageBottom() {
    const doc = document.documentElement;
    if (doc.scrollHeight <= window.innerHeight + 2) return true;
    return window.innerHeight + window.scrollY >= doc.scrollHeight - 64;
  }

  function update() {
    setVisible(atPageBottom());
  }

  const obs = new IntersectionObserver(
    ([entry]) => setVisible(entry.isIntersecting),
    { threshold: 0, rootMargin: "0px" }
  );
  obs.observe(sentinel);
  update();
})();

/* mobile nav — 3-line toggle → X */
(function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;

  const mq = window.matchMedia("(max-width: 768px)");

  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (mq.matches) {
      nav.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    }
  }

  function onToggle(e) {
    e.preventDefault();
    setOpen(!document.body.classList.contains("nav-open"));
  }

  toggle.addEventListener("click", onToggle);
  toggle.addEventListener("pointerdown", () => toggle.classList.add("is-pressed"), { passive: true });
  toggle.addEventListener("pointerup", () => toggle.classList.remove("is-pressed"));
  toggle.addEventListener("pointercancel", () => toggle.classList.remove("is-pressed"));

  nav.addEventListener("click", (e) => {
    if (e.target === nav) setOpen(false);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setOpen(false);
  });

  mq.addEventListener("change", (e) => {
    if (e.matches) {
      nav.setAttribute("aria-hidden", String(!document.body.classList.contains("nav-open")));
    } else {
      setOpen(false);
      nav.removeAttribute("aria-hidden");
      document.body.style.overflow = "";
    }
  });

  if (mq.matches) nav.setAttribute("aria-hidden", "true");
})();

/* clock */
let clockTimer = null;
function tick() {
  if (!datetimeEl || document.hidden) return;
  datetimeEl.textContent = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });
}
function startClock() {
  tick();
  clearInterval(clockTimer);
  clockTimer = setInterval(tick, 1000);
}
if (datetimeEl) {
  startClock();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(clockTimer);
    else startClock();
  });
}

/* cursor follower — features: crosshair */
(function initCursor() {
  const cursorRoot = document.getElementById("cursor");
  if (!cursorRoot || !document.body.classList.contains("page-features")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  document.body.classList.add("has-custom-cursor");
  cursorRoot.remove();

  const crosshair = document.createElement("div");
  crosshair.className = "cursor-crosshair";
  crosshair.innerHTML = '<span class="cursor-crosshair-h"></span><span class="cursor-crosshair-v"></span>';
  document.body.appendChild(crosshair);

  const crossFullH = document.createElement("div");
  crossFullH.className = "cursor-crosshair-full cursor-crosshair-full-h";
  document.body.appendChild(crossFullH);

  const crossFullV = document.createElement("div");
  crossFullV.className = "cursor-crosshair-full cursor-crosshair-full-v";
  document.body.appendChild(crossFullV);

  function updateCursor(x, y) {
    crosshair.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    crossFullH.style.transform = `translate3d(0, ${y}px, 0) translateY(-50%)`;
    crossFullV.style.transform = `translate3d(${x}px, 0, 0) translateX(-50%)`;
  }

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    updateCursor(e.clientX, e.clientY);
  }

  if ("onpointerrawupdate" in window) {
    document.addEventListener("pointerrawupdate", onPointerMove, { passive: true });
  } else if (window.PointerEvent) {
    document.addEventListener("pointermove", onPointerMove, { passive: true });
  } else {
    document.addEventListener("mousemove", onPointerMove, { passive: true });
  }
})();

/* features — design grid preview */
(function initDesignGrid() {
  if (!document.body.classList.contains("page-features")) return;

  const gridToggle = document.getElementById("gridToggle");
  const gridPicker = document.getElementById("gridPicker");
  const gridControl = document.getElementById("gridControl");
  const designGrid = document.getElementById("designGrid");
  const designGridLines = document.getElementById("designGridLines");
  const designGridTag = document.getElementById("designGridTag");
  if (!gridToggle || !gridPicker || !designGrid || !designGridLines) return;

  let activeCols = 0;

  function buildGrid(cols) {
    designGridLines.textContent = "";
    for (let i = 0; i <= cols; i++) {
      const pct = (i / cols) * 100;
      const v = document.createElement("div");
      v.className = "design-grid-line design-grid-line-v";
      v.style.left = `${pct}%`;
      designGridLines.appendChild(v);

      const h = document.createElement("div");
      h.className = "design-grid-line design-grid-line-h";
      h.style.top = `${pct}%`;
      designGridLines.appendChild(h);
    }
  }

  function setGrid(cols) {
    activeCols = cols;
    gridPicker.querySelectorAll(".grid-picker-btn").forEach((btn) => {
      btn.classList.toggle("is-selected", Number(btn.dataset.cols) === cols);
    });

    if (!cols) {
      document.body.classList.remove("grid-preview");
      designGrid.hidden = true;
      designGrid.setAttribute("aria-hidden", "true");
      gridToggle.classList.remove("is-active");
      gridToggle.textContent = "Grid";
      if (designGridTag) designGridTag.textContent = "";
      try { sessionStorage.removeItem("hammer_grid_cols"); } catch (e) {}
      return;
    }

    buildGrid(cols);
    document.body.classList.add("grid-preview");
    designGrid.hidden = false;
    designGrid.setAttribute("aria-hidden", "false");
    gridToggle.classList.add("is-active");
    gridToggle.textContent = `Grid · ${cols}`;
    if (designGridTag) designGridTag.textContent = `${cols} × ${cols} module · ${(100 / cols).toFixed(4)}% unit`;
    try { sessionStorage.setItem("hammer_grid_cols", String(cols)); } catch (e) {}
  }

  gridToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = gridPicker.hidden;
    gridPicker.hidden = !open;
    gridToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  gridPicker.querySelectorAll(".grid-picker-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setGrid(Number(btn.dataset.cols));
      gridPicker.hidden = true;
      gridToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!gridControl?.contains(e.target)) {
      gridPicker.hidden = true;
      gridToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", debounce(() => {
    if (activeCols) buildGrid(activeCols);
  }, 150));

  try {
    const saved = Number(sessionStorage.getItem("hammer_grid_cols"));
    if (saved >= 3 && saved <= 8) setGrid(saved);
  } catch (e) {}
})();

/* hero load */
document.getElementById("hero")?.classList.add("loaded");

/* scroll reveal */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll("[data-reveal]").forEach((el) => revealObs.observe(el));

/* features index — white logo over hero */
(function initFeaturesHeader() {
  const hero = document.getElementById("hero");
  const header = document.querySelector(".site-header");
  if (!hero || !header) return;

  const update = rafThrottle(() => {
    header.classList.toggle("header-over-hero", window.scrollY < hero.offsetHeight * 0.85);
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", debounce(update, 150));
})();

/* feature article pages — snap logo to center on scroll (desktop) */
(function initFeatureArticleHeader() {
  const article = document.querySelector(".feature-article, .stylist-feature, .goth-feature");
  if (!article) return;

  const desktop = window.matchMedia("(min-width: 769px)");
  const isArchiving = document.body.classList.contains("page-archiving");
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const scrollStart = isArchiving ? rem() * 2 : 1;

  const update = rafThrottle(() => {
    if (!desktop.matches) {
      document.body.classList.remove("header-scrolled");
      return;
    }
    document.body.classList.toggle("header-scrolled", window.scrollY > scrollStart);
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", debounce(update, 150));
  desktop.addEventListener("change", update);
})();

/* archiving feature — white logo until ~1rem scroll */
(function initArchivingHeaderLogo() {
  if (!document.body.classList.contains("page-archiving")) return;

  const threshold = () =>
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  const update = rafThrottle(() => {
    document.body.classList.toggle("header-past-hero", window.scrollY > threshold());
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", debounce(update, 150));
})();

/* auto-scroll image strip */
(function initImageStrip() {
  const strips = document.querySelectorAll(".img-strip");
  if (!strips.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  scheduleIdle(() => {
  strips.forEach((strip) => {
    let dir = 1;
    let paused = false;
    let visible = false;
    let rafId = null;

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    strip.addEventListener("mouseenter", pause);
    strip.addEventListener("mouseleave", resume);
    strip.addEventListener("pointerdown", pause);
    strip.addEventListener("pointerup", resume);
    strip.addEventListener("pointercancel", resume);
    strip.addEventListener("touchstart", pause, { passive: true });
    strip.addEventListener("touchend", resume, { passive: true });

    function tick() {
      if (visible && !document.hidden && !paused && !strip.matches(":hover")) {
        const max = strip.scrollWidth - strip.clientWidth;
        if (max > 0) {
          const pos = strip.scrollLeft;
          const edge = Math.min(160, max * 0.2);
          let speed = 0.55;
          if (dir > 0 && pos > max - edge) speed *= Math.max(0.08, (max - pos) / edge);
          if (dir < 0 && pos < edge) speed *= Math.max(0.08, pos / edge);
          strip.scrollLeft += dir * speed;
          if (strip.scrollLeft >= max - 0.5) dir = -1;
          if (strip.scrollLeft <= 0.5) dir = 1;
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    const visObs = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { rootMargin: "120px" }
    );
    visObs.observe(strip);

    rafId = requestAnimationFrame(tick);
    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(rafId);
      visObs.disconnect();
    });
  });
  });
})();

/* features grid / list toggle */
(function initFeaturesViewToggle() {
  const viewToggle = document.getElementById("viewToggle");
  const featuresSection = document.getElementById("featuresSection");
  const featuresGrid = document.getElementById("featuresGrid");
  const featuresList = document.getElementById("featuresList");
  if (!viewToggle || !featuresSection || !featuresGrid || !featuresList) return;

  const gridItems = featuresGrid.querySelectorAll(".editorial-item");
  let mode = featuresSection.classList.contains("list-mode") ? "list" : "grid";

  function setPanelActive(panel, active) {
    panel.setAttribute("aria-hidden", active ? "false" : "true");
    if ("inert" in panel) panel.inert = !active;
  }

  function setFeaturesView(nextMode) {
    if (nextMode === mode) return;
    mode = nextMode;
    const listMode = nextMode === "list";

    featuresSection.classList.toggle("list-mode", listMode);
    setPanelActive(featuresGrid, !listMode);
    setPanelActive(featuresList, listMode);

    if (!listMode) {
      gridItems.forEach((el) => el.classList.add("visible"));
    }

    viewToggle.textContent = listMode ? "Grid view" : "List view";
    viewToggle.setAttribute("aria-pressed", listMode ? "true" : "false");

    scheduleIdle(() => {
      try { localStorage.setItem("hammer_features_view", nextMode); } catch (e) {}
    });
  }

  if (!featuresSection.dataset.viewInit) {
    const saved = (() => {
      try { return localStorage.getItem("hammer_features_view"); }
      catch (e) { return null; }
    })();
    if (saved === "list") setFeaturesView("list");
    else {
      setPanelActive(featuresGrid, true);
      setPanelActive(featuresList, false);
    }
  } else {
    setPanelActive(featuresGrid, mode !== "list");
    setPanelActive(featuresList, mode === "list");
  }

  viewToggle.addEventListener("click", () => {
    setFeaturesView(mode === "list" ? "grid" : "list");
  }, { passive: true });
})();

/* HammerTV — clickable thumbs, fake playback */
(function initHammerTV() {
  const player = document.getElementById("tvPlayer");
  if (!player) return;

  const wrap = document.getElementById("tvPlayerWrap");
  const main = document.querySelector(".tv-main");
  const poster = document.getElementById("tvPlayerPoster");
  const overlay = document.getElementById("tvPlayerOverlay");
  const controls = document.getElementById("tvPlayerControls");
  const progressFill = document.getElementById("tvProgressFill");
  const timeEl = document.getElementById("tvTime");
  const pauseBtn = document.getElementById("tvPause");
  const nowTitle = document.getElementById("tvNowTitle");
  const nowDek = document.getElementById("tvNowDek");
  const nowDuration = document.getElementById("tvNowDuration");
  const paywall = document.getElementById("tvPaywall");
  const paywallTitle = document.getElementById("tvPaywallTitle");
  const paywallClose = document.getElementById("tvPaywallClose");
  const paywallSubscribe = document.getElementById("tvPaywallSubscribe");
  const subscribeBtns = document.querySelectorAll(".tv-subscribe-btn");
  const videoModal = document.getElementById("tvVideoModal");
  const videoModalScrim = document.getElementById("tvVideoModalScrim");
  const videoModalClose = document.getElementById("tvFloatClose");
  const floatVideo = document.getElementById("tvFloatVideo");
  const floatPlay = document.getElementById("tvFloatPlay");
  const floatSeek = document.getElementById("tvFloatSeek");
  const floatTime = document.getElementById("tvFloatTime");
  const floatMute = document.getElementById("tvFloatMute");
  const floatTitle = document.getElementById("tvFloatTitle");
  const floatSource = document.getElementById("tvFloatSource");
  const floatStatus = document.getElementById("tvFloatStatus");
  const heroVideoSrc = player.dataset.video;
  const heroVideoFallback =
    "https://raw.githubusercontent.com/ta222222/hammer/refs/heads/main/pix/DSCN4541.webm";

  let playing = false;
  let paused = false;
  let tickId = null;
  let elapsed = 0;
  let totalSec = 0;
  let activeCard = null;

  function parseDuration(str) {
    const p = String(str || "0:00").split(":").map(Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    if (p.length === 2) return p[0] * 60 + p[1];
    return p[0] || 0;
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function formatDurationLabel(str) {
    const sec = parseDuration(str);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rm = m % 60;
      return rm ? `${h} hr ${rm} min` : `${h} hr`;
    }
    return s ? `${m} min ${s} sec` : `${m} min`;
  }

  function resumeFromCard(card) {
    const prog = card?.querySelector(".tv-progress");
    if (!prog?.style.width) return 0;
    const pct = parseFloat(prog.style.width) / 100;
    return Math.floor(pct * totalSec);
  }

  function cardData(el) {
    return {
      title: el.dataset.title,
      dek: el.dataset.dek,
      duration: el.dataset.duration,
      img: el.dataset.img,
      video: el.dataset.video,
      locked: el.dataset.locked === "true",
    };
  }

  function setFloatStatus(msg) {
    if (!floatStatus) return;
    if (!msg) {
      floatStatus.hidden = true;
      floatStatus.textContent = "";
      return;
    }
    floatStatus.hidden = false;
    floatStatus.textContent = msg;
  }

  function updateFloatControls() {
    if (!floatVideo || !floatSeek || !floatTime) return;
    const dur = floatVideo.duration;
    const cur = floatVideo.currentTime;
    if (Number.isFinite(dur) && dur > 0) {
      floatSeek.value = String(Math.round((cur / dur) * 1000));
      floatTime.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    } else {
      floatTime.textContent = `${fmt(cur)} / 0:00`;
    }
    if (floatPlay) floatPlay.textContent = floatVideo.paused ? "▶" : "❚❚";
    if (floatMute) floatMute.textContent = floatVideo.muted ? "Muted" : "Sound";
  }

  function ensureFloatSource(url) {
    if (!floatVideo) return;
    const target = url || heroVideoSrc;
    if (floatSource) floatSource.src = target;
    else floatVideo.src = target;
    floatVideo.load();
  }

  function tryFloatPlay() {
    if (!floatVideo) return;
    floatVideo.play()
      .then(() => {
        setFloatStatus("");
        updateFloatControls();
      })
      .catch(() => {
        setFloatStatus("Press ▶ to play");
        updateFloatControls();
      });
  }

  function startFloatPlayback(fromSec = 0) {
    if (!floatVideo) return;
    setFloatStatus("");
    ensureFloatSource(heroVideoSrc);

    const begin = () => {
      floatVideo.currentTime = fromSec;
      tryFloatPlay();
    };

    if (floatVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      begin();
      return;
    }

    floatVideo.addEventListener("canplay", begin, { once: true });
  }

  function openVideoModal(data) {
    if (!videoModal || !floatVideo || !heroVideoSrc) return;
    if (floatTitle && data?.title) floatTitle.textContent = data.title;
    delete floatVideo.dataset.fallbackTried;
    videoModal.hidden = false;
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tv-modal-open");
    document.body.style.overflow = "hidden";
    startFloatPlayback(0);
    videoModalClose?.focus();
  }

  function closeVideoModal() {
    if (!videoModal || !floatVideo) return;
    floatVideo.pause();
    delete floatVideo.dataset.fallbackTried;
    setFloatStatus("");
    videoModal.hidden = true;
    videoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tv-modal-open");
    document.body.style.overflow = "";
  }

  function toggleFloatPlayback() {
    if (!floatVideo) return;
    if (floatVideo.paused) tryFloatPlay();
    else floatVideo.pause();
    updateFloatControls();
  }

  function handleFloatVideoError() {
    if (!floatVideo) return;
    const code = floatVideo.error?.code;
    if (code === 4 && floatVideo.dataset.fallbackTried !== "1" && heroVideoFallback) {
      floatVideo.dataset.fallbackTried = "1";
      ensureFloatSource(heroVideoFallback);
      startFloatPlayback(floatVideo.currentTime || 0);
      return;
    }
    if (code === 4) {
      setFloatStatus("WebM not supported in this browser — try Chrome or Firefox");
    } else {
      setFloatStatus("Video failed to load — press ▶ to retry");
    }
    updateFloatControls();
  }

  function stopPlayback() {
    playing = false;
    paused = false;
    clearInterval(tickId);
    tickId = null;
    player.classList.remove("is-playing");
    overlay.hidden = false;
    controls.hidden = true;
    pauseBtn.textContent = "❚❚";
    wrap?.classList.remove("is-expanded");
    main?.classList.remove("is-theater");
  }

  function exitTheater() {
    stopPlayback();
    activeCard?.classList.remove("is-active");
    activeCard = null;
  }

  function togglePause() {
    if (!playing && elapsed >= totalSec) {
      startPlayback(0);
      pauseBtn.textContent = "❚❚";
      return;
    }
    if (!playing) return;
    paused = !paused;
    pauseBtn.textContent = paused ? "▶" : "❚❚";
  }

  function startPlayback(fromSec = 0) {
    playing = true;
    paused = false;
    elapsed = fromSec;
    player.classList.add("is-playing");
    overlay.hidden = true;
    controls.hidden = false;
    progressFill.style.width = `${(elapsed / totalSec) * 100}%`;
    timeEl.textContent = `${fmt(elapsed)} / ${fmt(totalSec)}`;

    clearInterval(tickId);
    tickId = setInterval(() => {
      if (paused) return;
      elapsed += 1;
      if (elapsed >= totalSec) {
        elapsed = totalSec;
        clearInterval(tickId);
        playing = false;
        pauseBtn.textContent = "▶";
        return;
      }
      progressFill.style.width = `${(elapsed / totalSec) * 100}%`;
      timeEl.textContent = `${fmt(elapsed)} / ${fmt(totalSec)}`;
    }, 1000);
  }

  function loadVideo(data, card, scroll = true) {
    if (data.locked) {
      paywallTitle.textContent = data.title;
      paywall.hidden = false;
      document.body.style.overflow = "hidden";
      return;
    }

    stopPlayback();
    poster.src = data.img;
    nowTitle.textContent = data.title;
    nowDek.textContent = data.dek;
    nowDuration.textContent = formatDurationLabel(data.duration);
    totalSec = parseDuration(data.duration);

    document.querySelectorAll(".tv-card").forEach((c) => c.classList.remove("is-active"));
    if (card) {
      card.classList.add("is-active");
      activeCard = card;
    }

    wrap.classList.add("is-expanded");
    main?.classList.add("is-theater");
    if (scroll) {
      window.scrollTo({ top: Math.max(0, wrap.offsetTop - 72), behavior: "auto" });
    }

    startPlayback(card ? resumeFromCard(card) : 0);
  }

  function playFromEl(el, scroll = true) {
    loadVideo(cardData(el), el.classList.contains("tv-card") ? el : null, scroll);
  }

  function activateCard(card) {
    document.querySelectorAll(".tv-card").forEach((c) => c.classList.remove("is-active"));
    card.classList.add("is-active");
    activeCard = card;
  }

  document.querySelectorAll(".tv-card").forEach((card) => {
    const thumb = card.querySelector("img");
    if (thumb && !thumb.getAttribute("loading")) thumb.loading = "lazy";
  });

  main?.addEventListener("click", (e) => {
    const card = e.target.closest(".tv-card");
    if (card) {
      e.preventDefault();
      activateCard(card);
      playFromEl(card);
      return;
    }
  });

  main?.addEventListener("keydown", (e) => {
    const card = e.target.closest(".tv-card");
    if (!card || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    activateCard(card);
    playFromEl(card);
  });

  player.addEventListener("click", (e) => {
    if (e.target.closest(".tv-pause") || e.target.closest(".tv-player-controls")) return;
    if (heroVideoSrc) {
      e.preventDefault();
      e.stopPropagation();
      openVideoModal(cardData(player));
      return;
    }
    if (player.classList.contains("is-playing")) {
      togglePause();
      return;
    }
    playFromEl(player, false);
  });

  player.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (heroVideoSrc) {
        openVideoModal(cardData(player));
        return;
      }
      if (player.classList.contains("is-playing")) togglePause();
      else playFromEl(player, false);
    }
  });

  pauseBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePause();
  });

  floatPlay?.addEventListener("click", toggleFloatPlayback);
  floatMute?.addEventListener("click", () => {
    if (!floatVideo) return;
    floatVideo.muted = !floatVideo.muted;
    updateFloatControls();
  });

  floatSeek?.addEventListener("input", () => {
    if (!floatVideo || !Number.isFinite(floatVideo.duration)) return;
    floatVideo.currentTime = (Number(floatSeek.value) / 1000) * floatVideo.duration;
    updateFloatControls();
  });

  floatVideo?.addEventListener("timeupdate", updateFloatControls);
  floatVideo?.addEventListener("loadedmetadata", updateFloatControls);
  floatVideo?.addEventListener("canplay", updateFloatControls);
  floatVideo?.addEventListener("play", () => {
    setFloatStatus("");
    updateFloatControls();
  });
  floatVideo?.addEventListener("pause", updateFloatControls);
  floatVideo?.addEventListener("ended", updateFloatControls);
  floatVideo?.addEventListener("error", handleFloatVideoError);
  floatVideo?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFloatPlayback();
  });

  videoModalClose?.addEventListener("click", closeVideoModal);
  videoModalScrim?.addEventListener("click", closeVideoModal);

  function closePaywall() {
    paywall.hidden = true;
    document.body.style.overflow = "";
  }

  paywallClose?.addEventListener("click", closePaywall);
  paywall?.addEventListener("click", (e) => {
    if (e.target === paywall) closePaywall();
  });

  subscribeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.closest(".tv-paywall")) {
        closePaywall();
        alert("Hammer TV subscription — placeholder. Checkout coming soon.");
        return;
      }
      paywallTitle.textContent = "Hammer TV";
      paywall.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (videoModal && !videoModal.hidden) {
      closeVideoModal();
      return;
    }
    if (paywall && !paywall.hidden) {
      closePaywall();
      return;
    }
    if (main?.classList.contains("is-theater")) exitTheater();
  });

  const playerObs = new IntersectionObserver(
    ([entry]) => player.classList.toggle("is-inview", entry.isIntersecting),
    { threshold: 0.12 }
  );
  playerObs.observe(player);
})();

(function initNewsAccordion() {
  const accordion = document.getElementById("newsAccordion");
  if (!accordion) return;

  const triggers = accordion.querySelectorAll(".news-toggle-trigger");

  function closeToggle(trigger) {
    const toggle = trigger.closest(".news-toggle");
    const panel = trigger.nextElementSibling;
    if (!toggle || !panel) return;
    trigger.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
    panel.style.maxHeight = "0px";
  }

  triggers.forEach((trigger) => {
    const toggle = trigger.closest(".news-toggle");
    const panel = trigger.nextElementSibling;
    if (!toggle || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      if (!isOpen) {
        triggers.forEach((other) => {
          if (other !== trigger && other.getAttribute("aria-expanded") === "true") {
            closeToggle(other);
          }
        });
      }

      trigger.setAttribute("aria-expanded", String(!isOpen));
      toggle.classList.toggle("is-open", !isOpen);
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
    });
  });
})();

(function initOfficeModals() {
  const grid = document.getElementById("officeGrid");
  const card = document.getElementById("officeHoverCard");
  if (!grid || !card) return;

  const tagEl = document.getElementById("officeHoverTag");
  const timeEl = document.getElementById("officeHoverTime");
  const headlineEl = document.getElementById("officeHoverHeadline");
  const detailEl = document.getElementById("officeHoverDetail");
  const sourceEl = document.getElementById("officeHoverSource");
  const items = grid.querySelectorAll(".office-item");
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  let activeItem = null;
  let raf = 0;

  function populate(item) {
    tagEl.textContent = item.dataset.tag || "";
    timeEl.textContent = item.dataset.time || "";
    headlineEl.textContent = item.querySelector(".office-item-headline")?.textContent || "";
    detailEl.textContent = item.dataset.detail || "";
    sourceEl.textContent = item.dataset.source || "";
  }

  function positionCard(x, y) {
    const pad = 16;
    const rect = card.getBoundingClientRect();
    let left = x + 18;
    let top = y - 12;

    if (left + rect.width > window.innerWidth - pad) {
      left = x - rect.width - 18;
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = window.innerHeight - rect.height - pad;
    }
    if (top < pad) top = pad;
    if (left < pad) left = pad;

    card.style.left = left + "px";
    card.style.top = top + "px";
  }

  function show(item, x, y) {
    populate(item);
    card.hidden = false;
    card.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      positionCard(x, y);
      card.classList.add("is-visible");
    });
  }

  function hide() {
    card.classList.remove("is-visible");
    card.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!card.classList.contains("is-visible")) card.hidden = true;
    }, 200);
    activeItem?.classList.remove("is-active");
    activeItem = null;
  }

  items.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      if (isCoarse) return;
      activeItem?.classList.remove("is-active");
      activeItem = item;
      item.classList.add("is-active");
      show(item, e.clientX, e.clientY);
    });

    item.addEventListener("mousemove", (e) => {
      if (isCoarse || !activeItem) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => positionCard(e.clientX, e.clientY));
    });

    item.addEventListener("mouseleave", () => {
      if (isCoarse) return;
      hide();
    });

    item.addEventListener("click", (e) => {
      if (!isCoarse) return;
      e.preventDefault();
      if (activeItem === item) {
        hide();
        return;
      }
      activeItem?.classList.remove("is-active");
      activeItem = item;
      item.classList.add("is-active");
      show(item, window.innerWidth / 2, window.innerHeight / 2);
    });

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (activeItem === item) hide();
        else {
          activeItem?.classList.remove("is-active");
          activeItem = item;
          item.classList.add("is-active");
          show(item, window.innerWidth / 2, window.innerHeight / 2);
        }
      }
      if (e.key === "Escape") hide();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeItem) hide();
  });
})();
