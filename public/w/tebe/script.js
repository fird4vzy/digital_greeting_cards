/* ==========================================================================
   script.js — everything the site needs, in one file, split into clearly
   labelled sections/modules (each still its own IIFE, exactly like the
   original multi-file setup, just concatenated in load order):

     Utils          shared helpers
     MusicPlayer    background song + vinyl player, persists across scenes
     Sky            night-sky canvas: stars, ambient particles, comet, glow
     Parallax       subtle pointer-driven drift for the background art layer
     FinalVideo     the finale: fades in the finished video2 clip full-screen,
                    keeps song.mp3 playing underneath with video2's own audio
                    muted, then fades back out into the starry closing screen
     Story          the chapter timeline that drives Sky + on-screen lines
     (bootstrap)    wires up the first screen and hands off to Story

   The old RibbonFinale (a canvas thread that hand-wrote "Я люблю тебя") has
   been removed entirely and replaced by FinalVideo/video2 below. The scene
   background now uses assets/background.jpg. The stray colored ring near
   the vinyl was a focus-outline artifact, not the tonearm — fixed in
   style.css, turntable/disc/tonearm are untouched. Story text has been
   shortened chapter by chapter, and the music still tries to start itself
   on load instead of waiting for a click on the vinyl.
   ========================================================================== */

/* ==========================================================================
   Utils — small shared helpers
   ========================================================================== */
const Utils = (() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  return { clamp, lerp, rand, pick, easeInOutSine, easeOutCubic, easeOutQuint, sleep };
})();

/* ==========================================================================
   MusicPlayer — background song + vinyl player, persists across all scenes
   ========================================================================== */
const MusicPlayer = (() => {
  let audioEl, vinylEl, started = false;

  function init() {
    audioEl = document.getElementById('song');
    vinylEl = document.getElementById('vinyl');
    audioEl.loop = true;
    audioEl.volume = 0;

    vinylEl.addEventListener('click', toggle);
    vinylEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    audioEl.addEventListener('play', () => vinylEl.classList.add('playing'));
    audioEl.addEventListener('pause', () => vinylEl.classList.remove('playing'));

    // Try to start the music immediately, unprompted.
    start();

    // If the browser's autoplay policy blocked that, fall back to the very
    // first interaction anywhere on the page — not specifically a click on
    // the vinyl or the "Продолжить" button, so nobody has to go hunt for it.
    const kickstart = () => start();
    ['pointerdown', 'keydown', 'touchstart'].forEach((evt) =>
      document.addEventListener(evt, kickstart, { once: true, passive: true })
    );
  }

  function fadeVolume(target, ms) {
    const start = audioEl.volume;
    const t0 = performance.now();
    function step(t) {
      const p = Utils.clamp((t - t0) / ms, 0, 1);
      audioEl.volume = Utils.lerp(start, target, p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Safe to call many times — only the first successful call actually starts
  // playback; later calls are no-ops once `started` is true.
  async function start() {
    if (started) return;
    started = true;
    try {
      await audioEl.play();
      fadeVolume(0.62, 1400);
    } catch (err) {
      // Autoplay blocked — the interaction listeners above will retry.
      started = false;
    }
  }

  function toggle() {
    if (!started) { start(); return; }
    if (audioEl.paused) {
      audioEl.play();
      fadeVolume(0.62, 500);
    } else {
      fadeVolume(0, 350);
      setTimeout(() => { if (audioEl.volume < 0.02) audioEl.pause(); }, 380);
    }
  }

  return { init, start, toggle };
})();

/* ==========================================================================
   Sky — persistent night-sky canvas used for every post-video chapter
   Draws: layered parallax stars, ambient particles, a realization glow
   point, and a one-shot comet.

   Note: this used to also draw a big procedural red "thread" line across
   the sky. That's gone now — assets/background.jpg already shows the red
   thread between the two hands, so a second hand-drawn line on top of it
   would just be redundant (and was the "непонятная линия" feedback).
   ========================================================================== */
const Sky = (() => {
  let canvas, ctx, w, h, dpr;
  let raf = null;
  let t0 = performance.now();

  let stars = [];
  let motes = [];
  let comet = null;

  const cfg = {
    particleDensity: 1,     // 0..1.6
    particleWarmth: 0,      // 0..1  (cool blue -> warm gold)
    glow: { x: 0.5, y: 0.46, strength: 0 }, // realization point
    brightness: 1,          // overall star/particle brightness multiplier
  };

  function setConfig(partial) {
    Object.assign(cfg, partial);
    if (partial.glow) Object.assign(cfg.glow, partial.glow);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    buildMotes();
  }

  function buildStars() {
    stars = [];
    const layers = [
      { count: 90, rMin: 0.4, rMax: 1.0, aMin: 0.25, aMax: 0.55, speed: 0.004 },
      { count: 60, rMin: 0.7, rMax: 1.6, aMin: 0.35, aMax: 0.75, speed: 0.009 },
      { count: 34, rMin: 1.1, rMax: 2.2, aMin: 0.55, aMax: 1.0, speed: 0.016 },
    ];
    layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random() * 0.86,
          r: Utils.rand(layer.rMin, layer.rMax),
          baseA: Utils.rand(layer.aMin, layer.aMax),
          phase: Math.random() * Math.PI * 2,
          twinkle: Utils.rand(0.6, 1.8),
          layer: li,
          drift: layer.speed * (Math.random() > 0.5 ? 1 : -1),
        });
      }
    });
  }

  function buildMotes() {
    motes = [];
    const count = 46;
    for (let i = 0; i < count; i++) {
      motes.push(newMote());
    }
  }
  function newMote() {
    return {
      x: Math.random(),
      y: 1 + Math.random() * 0.2,
      r: Utils.rand(0.6, 2.0),
      speed: Utils.rand(0.006, 0.018),
      sway: Utils.rand(0.15, 0.5),
      phase: Math.random() * Math.PI * 2,
      baseA: Utils.rand(0.15, 0.55),
    };
  }

  function triggerComet() {
    const y0 = Utils.rand(0.12, 0.32);
    comet = {
      x: -0.08,
      y: y0,
      vx: Utils.rand(0.00011, 0.00014),
      vy: Utils.rand(0.000026, 0.000042),
      trail: [],
      life: 1,
    };
  }

  function drawVignetteBase() {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.32, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(30,38,70,' + (0.28 * cfg.brightness) + ')');
    g.addColorStop(1, 'rgba(4,5,11,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawStars(time) {
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(time * 0.0009 * s.twinkle + s.phase);
      const a = Utils.clamp(s.baseA * (0.55 + 0.45 * tw) * cfg.brightness, 0, 1);
      const x = ((s.x + Math.sin(time * 0.00004 + s.phase) * 0.004 + s.drift * (time * 0.00002)) % 1 + 1) % 1;
      const px = x * w;
      const py = s.y * h;
      const r = s.r * (1 + 0.15 * tw) * (window.innerWidth < 640 ? 0.85 : 1);

      ctx.beginPath();
      if (s.layer === 2) {
        const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 4.2);
        glow.addColorStop(0, `rgba(247,244,236,${a})`);
        glow.addColorStop(1, 'rgba(247,244,236,0)');
        ctx.fillStyle = glow;
        ctx.arc(px, py, r * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(247,244,236,${a})`;
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGlowPoint() {
    const { x, y, strength } = cfg.glow;
    if (strength <= 0.002) return;
    const px = x * w, py = y * h;
    const R = Math.max(w, h) * 0.28 * strength;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, R);
    grad.addColorStop(0, `rgba(255,247,227,${0.9 * strength})`);
    grad.addColorStop(0.28, `rgba(240,201,135,${0.35 * strength})`);
    grad.addColorStop(1, 'rgba(240,201,135,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,252,240,${Math.min(1, strength * 1.2)})`;
    ctx.arc(px, py, 2.6 + 2 * strength, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMotes(time) {
    const density = cfg.particleDensity;
    const n = Math.round(motes.length * density);
    for (let i = 0; i < n; i++) {
      const m = motes[i];
      m.y -= m.speed * 0.016;
      const sway = Math.sin(time * 0.0012 + m.phase) * m.sway * 0.01;
      const x = (m.x + sway) * w;
      const y = m.y * h;
      if (m.y < -0.05) Object.assign(m, newMote(), { y: 1 + Math.random() * 0.1 });

      const warmR = Utils.lerp(247, 240, cfg.particleWarmth);
      const warmG = Utils.lerp(244, 201, cfg.particleWarmth);
      const warmB = Utils.lerp(236, 135, cfg.particleWarmth);
      const flick = 0.6 + 0.4 * Math.sin(time * 0.003 + m.phase * 3);
      const a = m.baseA * flick * cfg.brightness;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${warmR|0},${warmG|0},${warmB|0},${Utils.clamp(a,0,1)})`;
      ctx.arc(x, y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- real comet animation loop (separate lightweight state machine) ----
  function updateComet(dt) {
    if (!comet) return;
    comet.trail.push({ x: comet.x, y: comet.y, a: 1 });
    if (comet.trail.length > 26) comet.trail.shift();
    comet.x += comet.vx * dt;
    comet.y += comet.vy * dt;

    ctx.save();
    for (let i = 0; i < comet.trail.length; i++) {
      const p = comet.trail[i];
      const a = (i / comet.trail.length) * 0.5;
      const px = p.x * w, py = p.y * h;
      const r = 1 + (i / comet.trail.length) * 2.6;
      ctx.beginPath();
      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 5);
      g.addColorStop(0, `rgba(255,249,235,${a})`);
      g.addColorStop(1, 'rgba(255,249,235,0)');
      ctx.fillStyle = g;
      ctx.arc(px, py, r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    const hx = comet.x * w, hy = comet.y * h;
    ctx.beginPath();
    const headGlow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 18);
    headGlow.addColorStop(0, 'rgba(255,255,245,0.95)');
    headGlow.addColorStop(1, 'rgba(255,255,245,0)');
    ctx.fillStyle = headGlow;
    ctx.arc(hx, hy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#fffdf5';
    ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (comet.x > 1.12 || comet.y > 1.12) comet = null;
  }

  function loop(time) {
    const dt = time - t0;
    t0 = time;
    ctx.clearRect(0, 0, w, h);
    drawVignetteBase();
    drawStars(time);
    drawGlowPoint();
    drawMotes(time);
    updateComet(dt);
    raf = requestAnimationFrame(loop);
  }

  function mount() {
    canvas = document.getElementById('sky');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  }

  return { mount, setConfig, triggerComet, get width() { return w; }, get height() { return h; } };
})();

/* ==========================================================================
   Parallax — subtle pointer-driven drift for the background art layer.
   Deliberately its own tiny module: it only ever touches .scene-bg-wrap's
   transform, never .scene-bg's (that one is owned by the CSS fade/zoom), so
   the two motions can't stomp on each other.
   ========================================================================== */
const Parallax = (() => {
  let wrap = null;

  function mount(el) {
    wrap = el;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
  }

  function onMove(e) {
    if (!wrap) return;
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;
    apply(px, py);
  }

  function onTilt(e) {
    if (!wrap || e.gamma == null) return;
    const px = Utils.clamp(e.gamma / 30, -0.5, 0.5);
    const py = Utils.clamp((e.beta - 45) / 30, -0.5, 0.5);
    apply(px, py);
  }

  function apply(px, py) {
    wrap.style.transform = `translate3d(${(-px * 16).toFixed(2)}px, ${(-py * 12).toFixed(2)}px, 0)`;
  }

  return { mount };
})();

/* ==========================================================================
   FinalVideo — the finale: fades in the finished assets/video2.mp4 clip
   full-screen, autoplaying it muted (its own audio track is stripped out
   entirely — song.mp3 just keeps playing underneath, never paused, never
   swapped), waits for it to play all the way through on its own, then
   fades it back out so Story can reveal the starry closing screen.
   ========================================================================== */
const FinalVideo = (() => {
  let videoEl;

  function mount() {
    videoEl = document.getElementById('final-video');
    videoEl.muted = true;
    videoEl.volume = 0;
    videoEl.pause();
    videoEl.currentTime = 0;
  }

  // Resolves once video2 has fully played AND finished fading back out —
  // so callers never have to guess at a timeout.
  function play() {
    return new Promise((resolve) => {
      videoEl.muted = true;
      videoEl.currentTime = 0;

      const reveal = () => requestAnimationFrame(() => videoEl.classList.add('show'));

      const onEnded = () => {
        videoEl.removeEventListener('ended', onEnded);
        videoEl.classList.remove('show');
        // let the CSS opacity transition finish before handing back control
        setTimeout(resolve, 1650);
      };
      videoEl.addEventListener('ended', onEnded);

      const p = videoEl.play();
      if (p && p.then) p.then(reveal).catch(reveal);
      else reveal();
    });
  }

  return { mount, play };
})();


/* ==========================================================================
   Story — the chapter timeline. Each chapter drives Sky's config and a
   short sequence of lines with varied cinematic transitions: ENTER -> HOLD
   -> EXIT -> pause -> next. Never more than one line on screen at once.
   Lines are deliberately few and short — a handful of words at a time —
   carrying the mood of "Твоё имя" (a red thread, distance, a comet, a
   meeting written into memory) without ever naming the film outright.
   Chapter 6 fades the artwork to black; chapter 7 hands off to video2.
   ========================================================================== */
const Story = (() => {
  const textEl = document.getElementById('scene-text');
  const finaleCaption = document.getElementById('finale-caption');
  const sceneBg = document.getElementById('scene-bg');
  const sceneBgWrap = document.getElementById('scene-bg-wrap');

  const DURATIONS = {
    't-blur': 2100, 't-rise': 2000, 't-scale': 2200, 't-light': 2400, 't-drift': 2300,
  };
  const EXIT_MS = 1250;

  async function showLine(text, variant = 't-blur', holdMs = 2500) {
    textEl.textContent = text;
    textEl.className = 'scene-text ' + variant;
    // eslint-disable-next-line no-unused-expressions
    void textEl.offsetWidth; // force reflow so the animation restarts
    textEl.classList.add('enter');
    const enterMs = DURATIONS[variant] || 2000;
    await Utils.sleep(enterMs * 0.55); // let it become mostly legible
    await Utils.sleep(holdMs);
    textEl.classList.remove('enter');
    textEl.classList.add('exit');
    await Utils.sleep(EXIT_MS);
    textEl.textContent = '';
    textEl.className = 'scene-text';
  }

  async function pause(ms) { await Utils.sleep(ms); }

  async function runLines(lines) {
    for (const l of lines) {
      await showLine(l.text, l.variant, l.hold ?? 2500);
      if (l.pauseAfter) await pause(l.pauseAfter);
    }
  }

  /* -------- chapter 1: постепенное сближение -------- */
  async function chapter1() {
    Sky.setConfig({ particleDensity: 0.7, particleWarmth: 0.05, brightness: 0.9 });
    await runLines([
      { text: 'Сначала — просто разговор.', variant: 't-blur', hold: 2200, pauseAfter: 900 },
      { text: 'А потом ты замечаешь…', variant: 't-drift', hold: 2100 },
      { text: 'этот человек уже где-то рядом с твоими мыслями.', variant: 't-rise', hold: 2800 },
    ]);
  }

  /* -------- chapter 2: маленькие детали -------- */
  async function chapter2() {
    Sky.setConfig({ particleDensity: 1.1, particleWarmth: 0.55, brightness: 1 });
    await runLines([
      { text: 'Ждать сообщения.', variant: 't-drift', hold: 1700 },
      { text: 'Улыбаться без причины.', variant: 't-scale', hold: 1900, pauseAfter: 900 },
      { text: 'Так «просто нравится» тихо становится чем-то большим.', variant: 't-blur', hold: 2800 },
    ]);
  }

  /* -------- chapter 3: осознание, glowing point -------- */
  async function chapter3() {
    Sky.setConfig({ particleDensity: 0.5, particleWarmth: 0.3, brightness: 0.85, glow: { strength: 0 } });
    animateGlow(0, 0.9, 2600);
    await runLines([
      { text: 'Не было одной особенной секунды.', variant: 't-light', hold: 2200, pauseAfter: 900 },
      { text: 'Просто однажды я понял…', variant: 't-drift', hold: 2000 },
      { text: 'что ты стала особенной.', variant: 't-scale', hold: 2800 },
    ]);
    animateGlow(0.9, 0, 1800);
    await pause(600);
  }

  function animateGlow(from, to, ms) {
    const t0 = performance.now();
    function step(t) {
      const p = Utils.clamp((t - t0) / ms, 0, 1);
      Sky.setConfig({ glow: { strength: Utils.lerp(from, to, Utils.easeInOutSine(p)) } });
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* -------- chapter 4: расстояние и комета -------- */
  async function chapter4() {
    Sky.setConfig({ particleDensity: 0.6, particleWarmth: 0.1, brightness: 1.05, glow: { strength: 0 } });
    await showLine('Говорят, некоторых людей связывает нить.', 't-blur', 2600);
    await pause(1400);
    await showLine('Даже когда между ними — целое небо.', 't-rise', 2800);
    Sky.triggerComet();
    await pause(4000);
    await showLine('Иногда эта связь появляется раньше, чем её замечают.', 't-light', 3000);
  }

  /* -------- chapter 5: красная нить -------- */
  async function chapter5() {
    Sky.setConfig({ particleDensity: 0.5, particleWarmth: 0.4 });
    await runLines([
      // The line lands right as the red-thread artwork is clearest on
      // screen — the words point at the image instead of another drawn line.
      { text: 'Некоторые связи не зависят от расстояния.', variant: 't-blur', hold: 2600, pauseAfter: 1200 },
      { text: 'Может быть, любовь — это не один момент.', variant: 't-scale', hold: 2600, pauseAfter: 1000 },
      { text: 'А сотни маленьких, из которых складывается одно большое.', variant: 't-rise', hold: 3000 },
    ]);
  }

  /* -------- chapter 6: тишина перед признанием -------- */
  async function chapter6() {
    Sky.setConfig({ particleDensity: 0.35, brightness: 0.8 });
    await pause(3200); // "несколько секунд ничего не показывай"
    await showLine('Я не буду искать идеальных слов.', 't-blur', 2400);
    await pause(1300);
    await showLine('Просто то, что давно хотел сказать.', 't-rise', 2800);
    await pause(1000);
    // everything dims to black so video2 can take over without a hard cut
    Sky.setConfig({ particleDensity: 0.15, brightness: 0.4 });
    sceneBg.style.transition = 'opacity 2.2s var(--ease-soft)';
    sceneBg.style.opacity = '0';
    await pause(2400);
  }

  /* -------- chapter 7: финал — video2, затем звёздное небо -------- */
  async function chapter7() {
    Sky.setConfig({ particleDensity: 0.15, brightness: 0.35 });
    await pause(500);

    // video2 fades in over the now-dark sky and plays through on its own —
    // song.mp3 is never touched, video2's own audio stays muted throughout.
    await FinalVideo.play();

    // the red ribbon inside video2 has just closed the shot to black —
    // continue straight into the starry night and let the stars bloom back up
    Sky.setConfig({ brightness: 1.15, particleDensity: 1, particleWarmth: 0.35 });
    await pause(900);

    // a warm glow rises right behind where the confession will sit, so the
    // words don't just appear on a flat sky — they arrive with their own light
    Sky.setConfig({ glow: { x: 0.5, y: 0.64, strength: 0 } });
    animateGlow(0, 0.85, 3200);
    finaleCaption.classList.add('show');
  }

  async function begin() {
    document.getElementById('stage-scenes').classList.add('active');
    document.getElementById('stage-scenes').setAttribute('aria-hidden', 'false');
    Sky.mount();
    FinalVideo.mount();
    Parallax.mount(sceneBgWrap);

    // Cinematic order: background/atmosphere first, everything else after.
    sceneBg.classList.add('show');
    await pause(1400);

    await pause(600);
    await chapter1();
    await chapter2();
    await chapter3();
    await chapter4();
    await chapter5();
    await chapter6();
    await chapter7();
  }

  return { begin };
})();

/* ==========================================================================
   Bootstrap — first screen (hero video) + hand-off to Story
   ========================================================================== */
(() => {
  const video = document.getElementById('hero-video');
  const stageVideo = document.getElementById('stage-video');
  const continueBtn = document.getElementById('continue-btn');
  const line1 = document.querySelector('.hero-line[data-line="1"]');
  const line2 = document.querySelector('.hero-line[data-line="2"]');

  function tryPlayVideo() {
    const p = video.play();
    if (p && p.catch) p.catch(() => {
      // Autoplay might be blocked until first gesture — retry then.
      const retry = () => { video.play().catch(() => {}); document.removeEventListener('click', retry); };
      document.addEventListener('click', retry, { once: true });
    });
  }

  async function introSequence() {
    await Utils.sleep(900);
    line1.classList.add('show');
    await Utils.sleep(3600);
    line2.classList.add('show');
    await Utils.sleep(4200);
    continueBtn.classList.add('show');
  }

  async function handleContinue() {
    continueBtn.classList.add('fading');
    line1.style.transition = 'opacity 1.2s ease';
    line2.style.transition = 'opacity 1.2s ease';
    line1.style.opacity = '0';
    line2.style.opacity = '0';

    MusicPlayer.start(); // no-op if it's already playing — extra safety net

    stageVideo.style.transition = 'opacity 1.8s ease';
    stageVideo.style.opacity = '0';

    await Utils.sleep(1200);
    stageVideo.style.display = 'none';

    Story.begin();
  }

  document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init(); // attempts to start the song immediately on load
    tryPlayVideo();
    introSequence();
    continueBtn.addEventListener('click', handleContinue, { once: true });
  });
})();
