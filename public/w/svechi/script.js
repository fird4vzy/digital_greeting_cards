(function(){
  "use strict";

  const NAME = "Алина";
  const textLayer = document.getElementById('textLayer');
  const cakeLayer = document.getElementById('cakeLayer');
  const cakeWrap = document.getElementById('cakeWrap');
  const cakeGlow = document.getElementById('cakeGlow');
  const gustFlash = document.getElementById('gustFlash');
  const candlesWrap = document.getElementById('candles');
  const finalGreetingEl = document.getElementById('finalGreeting');
  const countdownLayer = document.getElementById('countdownLayer');
  const photoLayer = document.getElementById('photoLayer');
  const sparklesEl = document.getElementById('sparkles');
  const motesEl = document.getElementById('motes');
  const finalParticles = document.getElementById('finalParticles');
  const song = document.getElementById('song');
  const vinyl = document.getElementById('vinyl');
  const player = document.getElementById('player');

  const CANDLE_COUNT = 5;

  function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }
  function clear(el){ el.innerHTML = ''; }

  async function showLine(parent, html, {hold=2200, enter=1000, exit=700, cls=''} = {}){
    const el = document.createElement('div');
    el.className = 'line ' + cls;
    el.style.setProperty('--enter', enter+'ms');
    el.style.setProperty('--exit', exit+'ms');
    el.innerHTML = html;
    parent.appendChild(el);
    await sleep(40);
    el.classList.add('enter');
    await sleep(enter);
    await sleep(hold);
    el.classList.remove('enter');
    el.classList.add('exit');
    await sleep(exit);
    el.remove();
  }

  function makeSparkles(n){
    for(let i=0;i<n;i++){
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = (Math.random()*100)+'%';
      s.style.top = (40+Math.random()*55)+'%';
      s.style.animationDuration = (5+Math.random()*6)+'s';
      s.style.animationDelay = (Math.random()*8)+'s';
      sparklesEl.appendChild(s);
    }
  }
  makeSparkles(22);

  function makeMotes(n){
    clear(motesEl);
    for(let i=0;i<n;i++){
      const m = document.createElement('div');
      m.className = 'mote';
      m.style.left = (20+Math.random()*60)+'%';
      m.style.top = (12+Math.random()*35)+'%';
      m.style.setProperty('--mx', (Math.random()*40-20)+'px');
      m.style.setProperty('--my', (-24-Math.random()*30)+'px');
      m.style.animationDuration = (6+Math.random()*5)+'s';
      m.style.animationDelay = (Math.random()*5)+'s';
      motesEl.appendChild(m);
    }
  }

  /* ---------------- Music ---------------- */
  function setPlayingUI(isPlaying){
    vinyl.classList.toggle('playing', isPlaying);
  }
  song.addEventListener('play', ()=>setPlayingUI(true));
  song.addEventListener('pause', ()=>setPlayingUI(false));
  vinyl.addEventListener('click', ()=>{
    if(song.paused){ song.play().catch(()=>{}); }
    else { song.pause(); }
  });
  function revealPlayer(){ player.classList.add('show'); }

  /* ---------------- Cake (SVG, built once) ----------------
     Tier geometry is defined once here and reused both to draw the SVG
     and to place the candles, so the candles are always mathematically
     locked to the top tier's frosting line — they can never drift off
     the cake regardless of viewport size. */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const VB_W = 320, VB_H = 250;
  function svgEl(tag, attrs){
    const el = document.createElementNS(SVGNS, tag);
    for(const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  const TIERS = [
    {x:22,  y:170, w:276, h:64, rx:16, grad:'url(#tierGrad)',    scallopR:12,  pearlR:2.6, drip:true},
    {x:66,  y:108, w:188, h:60, rx:14, grad:'url(#tierGrad)',    scallopR:10,  pearlR:2.3, drip:true},
    {x:106, y:52,  w:108, h:54, rx:12, grad:'url(#tierGradTop)', scallopR:9,   pearlR:2,   drip:false},
  ];

  function buildCakeSVG(){
    const body = document.getElementById('cakeBody');
    if(!body) return;
    while(body.firstChild) body.removeChild(body.firstChild);

    // soft contact shadows where each tier meets the one beneath it —
    // this is what gives the stack real depth instead of flat rectangles
    for(let i=0;i<TIERS.length-1;i++){
      const t = TIERS[i];
      body.appendChild(svgEl('ellipse', {
        cx:t.x+t.w/2, cy:t.y+2, rx:t.w*0.42, ry:6, fill:'url(#shadowGrad)'
      }));
    }

    TIERS.forEach(t=>{
      body.appendChild(svgEl('rect',{x:t.x, y:t.y, width:t.w, height:t.h, rx:t.rx, fill:t.grad}));

      // soft filling band, hints at layers inside the sponge
      body.appendChild(svgEl('rect',{x:t.x+4, y:t.y+t.h*0.56, width:t.w-8, height:3.6, rx:1.8, fill:'#d98fa0', opacity:.22}));

      // directional sheen, fakes roundness on what is technically a flat rect
      body.appendChild(svgEl('rect',{x:t.x, y:t.y, width:t.w, height:t.h, rx:t.rx, fill:'url(#sheenGrad)'}));

      // piped scallop frosting along the top edge
      const r = t.scallopR, step = r*1.5;
      const scallop = svgEl('g', {fill:'url(#frostGrad)'});
      const drips = svgEl('g', {fill:'url(#frostGrad)'});
      let x = t.x + r*0.9, i = 0;
      while(x <= t.x + t.w - r*0.9){
        scallop.appendChild(svgEl('circle', {cx:x, cy:t.y+1, r:r}));
        if(t.drip && i % 3 === 1){
          const len = 9 + (i % 2 === 0 ? 5 : 0);
          const w = 3.6;
          drips.appendChild(svgEl('path', {
            d:`M ${x-w} ${t.y+6} Q ${x} ${t.y+6+len*1.15} ${x} ${t.y+6+len} Q ${x} ${t.y+6+len*1.15} ${x+w} ${t.y+6} Z`
          }));
        }
        x += step; i++;
      }
      body.appendChild(scallop);
      if(t.drip) body.appendChild(drips);

      // pearl trim near the base of the tier
      const pr = t.pearlR, pstep = pr*3.4;
      const pearls = svgEl('g', {fill:'#e8a3b3', opacity:.85});
      let px = t.x + pr*2;
      while(px <= t.x + t.w - pr*2){
        pearls.appendChild(svgEl('circle', {cx:px, cy:t.y+t.h-7, r:pr}));
        px += pstep;
      }
      body.appendChild(pearls);
    });

    // piped rosette + berries crowning the top tier
    const top = TIERS[2];
    const cx = top.x + top.w/2, cy = top.y + 5;
    const rosette = svgEl('g', {fill:'url(#frostGrad)'});
    [[0,0,7.5],[-9,-2,6.4],[9,-2,6.4],[0,-9,6]].forEach(([dx,dy,rr])=>{
      rosette.appendChild(svgEl('circle', {cx:cx+dx, cy:cy+dy, r:rr}));
    });
    body.appendChild(rosette);
    const berries = svgEl('g', {fill:'url(#berryGrad)'});
    berries.appendChild(svgEl('circle', {cx:cx-18, cy:cy+4, r:4.2}));
    berries.appendChild(svgEl('circle', {cx:cx+19, cy:cy+3, r:3.8}));
    body.appendChild(berries);
  }
  buildCakeSVG();

  /* ---------------- Candles ----------------
     Placed as HTML elements positioned in percentage-space that matches
     the SVG viewBox exactly (candles container is inset:0 over a wrapper
     that shares the SVG's aspect ratio), so each candle's base sits
     precisely on the top tier's frosting — physically on the cake. */
  function candlePositions(){
    const top = TIERS[2];
    const margin = top.w * 0.14;
    const usableW = top.w - margin*2;
    const positions = [];
    for(let i=0;i<CANDLE_COUNT;i++){
      const t = CANDLE_COUNT === 1 ? 0.5 : i/(CANDLE_COUNT-1);
      const x = top.x + margin + usableW * t;
      const y = top.y - top.scallopR * 0.65; // sits right on the piped frosting peak
      positions.push({left:(x/VB_W*100)+'%', top:(y/VB_H*100)+'%'});
    }
    return positions;
  }

  function buildCandles(){
    clear(candlesWrap);
    const pos = candlePositions();
    for(let i=0;i<CANDLE_COUNT;i++){
      const c = document.createElement('div');
      c.className = 'candle';
      c.style.left = pos[i].left;
      c.style.top = pos[i].top;
      c.innerHTML = `
        <div class="wick"></div>
        <div class="flame"><div class="core"></div><div class="halo"></div></div>
        <div class="smoke"></div>
      `;
      candlesWrap.appendChild(c);
    }
  }
  buildCandles();

  /* All candles are blown out together — one gust, one moment, not a
     sequence. Total elapsed time is kept close to a second. */
  async function blowOutCandlesTogether(){
    const candles = Array.from(candlesWrap.children);
    candles.forEach(c => c.classList.add('blowing'));
    gustFlash.classList.add('go');
    await sleep(260); // the flames lean into the gust
    candles.forEach(c => {
      c.classList.add('out');
      c.querySelector('.smoke').classList.add('go');
    });
    await sleep(180);
    gustFlash.classList.remove('go');
    await sleep(600); // smoke keeps dissolving quietly
  }

  async function relightCandles(){
    const candles = Array.from(candlesWrap.children);
    for(const c of candles){
      c.classList.remove('out','blowing');
      c.classList.add('lighting');
      await sleep(480);
      await sleep(260);
    }
  }

  /* ---------------- Scenes ---------------- */

  async function sceneIntro(){
    await showLine(textLayer, 'Сегодня один день в году немного особенный&hellip;', {enter:1400, hold:2800, exit:900});
    await sleep(700);
    await showLine(textLayer, 'И я хочу показать тебе почему.', {enter:1400, hold:2600, exit:900});
    await sleep(800);

    const btn = document.createElement('button');
    btn.className = 'cta';
    btn.textContent = 'Начать';
    textLayer.appendChild(btn);
    await sleep(30);
    btn.classList.add('enter');

    await new Promise(resolve=>{
      btn.addEventListener('click', function onClick(){
        btn.removeEventListener('click', onClick);
        song.play().catch(()=>{});
        revealPlayer();
        resolve();
      }, {once:true});
    });

    btn.classList.remove('enter');
    btn.classList.add('exit');
    await sleep(650);
    btn.remove();

    await wipeTransition();
  }

  async function wipeTransition(inMs=1300, outMs=1000){
    const wipe = document.createElement('div');
    wipe.style.cssText = `position:absolute;inset:0;background:var(--bg-deep);opacity:0;transition:opacity ${inMs}ms ease;z-index:80;pointer-events:none;`;
    document.getElementById('app').appendChild(wipe);
    await sleep(20);
    wipe.style.opacity = '1';
    await sleep(inMs);
    clear(textLayer);
    wipe.style.transition = `opacity ${outMs}ms ease`;
    wipe.style.opacity = '0';
    await sleep(outMs);
    wipe.remove();
  }

  /* Scene: cake appears, then the wish is set up emotionally (not
     mechanically) before the countdown even starts. */
  async function sceneCakeAppears(){
    textLayer.classList.add('withCake');
    cakeLayer.classList.add('show');
    cakeWrap.classList.add('in');
    makeMotes(14);
    motesEl.classList.add('show');
    await sleep(1800);

    await showLine(textLayer, 'Но сначала — самое важное&hellip;', {hold:2600, enter:1300, exit:900});
    await sleep(900);
    await showLine(textLayer, 'Загадай желание. ✨', {hold:1400, enter:1300, exit:800, cls:'script'});
    await sleep(500);
  }

  /* A full, unhurried 10 seconds to actually make the wish — the
     candlelight, glow and particles keep living quietly in the
     background the whole time. */
  async function sceneCountdown(){
    const nums = ['10','9','8','7','6','5','4','3','2','1'];
    for(const n of nums){
      const el = document.createElement('div');
      el.className = 'num';
      el.textContent = n;
      countdownLayer.appendChild(el);
      await sleep(20);
      el.classList.add('enter');
      await sleep(430);
      await sleep(330); // hold — roughly one second per number in total
      el.classList.remove('enter');
      el.classList.add('exit');
      await sleep(420);
      el.remove();
      await sleep(0);
    }
    await sleep(500);

    await showLine(textLayer, 'Готово?', {hold:1100, enter:900, exit:600, cls:'script'});
    await sleep(400);
    await showLine(textLayer, 'А теперь задуй свечи&hellip; 🕯️', {hold:1300, enter:1000, exit:700, cls:'script'});
    await sleep(500);
  }

  /* One decisive "фуух" — every candle out together, a puff of light,
     a little smoke, then a warm afterglow. About a second, start to end. */
  async function sceneBlowCandles(){
    await blowOutCandlesTogether();
    cakeGlow.classList.remove('bright');
    await sleep(1600);

    await showLine(textLayer, 'Желание принято. ✨', {hold:2200, enter:1200, exit:800, cls:'script'});
    await sleep(800);
    await showLine(textLayer, 'А теперь начинается самое интересное&hellip;', {hold:2400, enter:1200, exit:900});
    await sleep(700);

    // cake fades away, motes settle, text returns to centre for the rest of the show
    motesEl.classList.remove('show');
    cakeWrap.style.transition = 'all 1.5s var(--ease)';
    cakeWrap.style.opacity = '0';
    cakeWrap.style.transform = 'scale(.92)';
    cakeWrap.style.filter = 'blur(10px)';
    await sleep(1500);
    cakeLayer.classList.remove('show');
    textLayer.classList.remove('withCake');
    await sleep(400);
  }

  /* 365 days: one clear idea instead of the old, unexplained "365 → ?".
     The number resolves slowly (blur -> sharp, scale -> 100%), then a
     handful of words settle quietly around it before the whole thought
     folds into "a new chapter begins today". */
  async function scene365(){
    await showLine(textLayer, 'Один год — это 365 дней.', {hold:2400, enter:1300, exit:900});
    await sleep(700);

    // The whole composition — number, surrounding words, and the caption
    // underneath — is built as ONE fixed layout before anything becomes
    // visible. Nothing is inserted later, so nothing can push the 365
    // out of place: nodes only ever change opacity/blur/scale from here on.
    const field = document.createElement('div');
    field.className = 'yearField';
    textLayer.appendChild(field);

    const numberArea = document.createElement('div');
    numberArea.className = 'yearNumberArea';
    field.appendChild(numberArea);

    const big = document.createElement('div');
    big.className = 'bignum';
    big.textContent = '365';
    numberArea.appendChild(big);

    // caption's slot exists from frame 1, already reserved below the
    // number — turning it on later is a pure opacity change
    const cap = document.createElement('div');
    cap.className = 'line whisper';
    cap.style.setProperty('--enter', '1200ms');
    cap.style.setProperty('--exit', '900ms');
    cap.textContent = 'И всё это становится частью одной истории.';
    field.appendChild(cap);

    await sleep(40);
    big.classList.add('enter');
    await sleep(1600);

    const words = ['утра','вечера','смех','встречи','маленькие победы','новые места','случайные моменты'];
    const positions = [
      {left:'8%',  top:'10%'}, {left:'82%', top:'8%'},  {left:'2%',  top:'48%'},
      {left:'88%', top:'50%'}, {left:'14%', top:'88%'}, {left:'70%', top:'90%'},
      {left:'46%', top:'2%'}
    ];
    const wordEls = [];
    for(let i=0;i<words.length;i++){
      const w = document.createElement('div');
      w.className = 'orbit-word';
      w.textContent = words[i];
      w.style.left = positions[i].left;
      w.style.top = positions[i].top;
      numberArea.appendChild(w);
      wordEls.push(w);
      await sleep(220);
      w.classList.add('enter');
    }
    await sleep(2000);

    await sleep(300);
    cap.classList.add('enter'); // the 365 does not move — only the caption fades in beside it
    await sleep(2400);

    // the whole composition folds away together
    wordEls.forEach(w=>{ w.classList.remove('enter'); w.classList.add('exit'); });
    cap.classList.remove('enter');
    cap.classList.add('exit');
    await sleep(700);
    big.classList.remove('enter');
    big.classList.add('exit');
    await sleep(1100);
    field.remove();
    await sleep(400);

    await showLine(textLayer, 'А сегодня начинается новая глава.', {hold:2600, enter:1300, exit:1000, cls:'big'});
    await sleep(900);

    await showLine(textLayer, 'Но сначала давай вспомним то, что уже стало частью истории.', {hold:2800, enter:1300, exit:1000});
    await sleep(900);
  }

  async function showPhoto(src, caption, {rot=0, holdExtra=0} = {}){
    // Enter/exit durations are set as CSS custom properties AND used as the
    // JS wait time — the element is only ever removed after its transition
    // has truly finished, which is what eliminates the end-of-move snap.
    const ENTER = 1500, EXIT = 1200;

    const wrap = document.createElement('div');
    wrap.className = 'photoWrapper'; // owns the slow idle drift only
    const card = document.createElement('div');
    card.className = 'photoCard';    // owns enter/exit scale+rotate+settle only
    card.style.setProperty('--rot', rot+'deg');
    card.style.setProperty('--enter', ENTER+'ms');
    card.style.setProperty('--exit', EXIT+'ms');
    const img = document.createElement('img'); // pixels only, no transform ever
    img.src = src;
    img.alt = '';
    card.appendChild(img);
    wrap.appendChild(card);

    // The caption's slot is created in the SAME layout pass as the photo,
    // before either is visible. Photo + caption are one fixed composition
    // from frame 1 — the caption only ever changes opacity/blur/transform
    // later, so it can never push or resize the photo above it.
    let capEl = null;
    if(caption){
      capEl = document.createElement('div');
      capEl.className = 'photoCaption';
      capEl.textContent = caption;
      capEl.style.setProperty('--enter', '900ms');
      wrap.appendChild(capEl);
    }

    photoLayer.appendChild(wrap);

    await sleep(30);
    card.classList.add('enter');
    await sleep(ENTER); // the photo settles completely and stops moving first

    await sleep(350); // a small pause before the caption speaks

    if(capEl){
      capEl.classList.add('enter'); // opacity/transform only — the photo does not move
      await sleep(900);
    }

    await sleep(1500 + holdExtra); // photo + caption held together, read calmly as one composition

    // photo and caption fade away together, as the single composition they are
    if(capEl){
      capEl.classList.remove('enter');
      capEl.classList.add('exit');
    }
    card.classList.remove('enter');
    card.classList.add('exit');
    await sleep(EXIT); // exit fully completes before the element is removed
    wrap.remove();
  }

  async function scenePhotos(){
    const photos = [
      {src:'./assets/photo1.jpg', cap:'Моменты, которые хочется сохранить.', rot:-2},
      {src:'./assets/photo2.jpg', cap:null, rot:1.5},
      {src:'./assets/photo3.jpg', cap:'То, что уже стало частью истории.', rot:-1.5},
      {src:'./assets/photo4.jpg', cap:null, rot:2},
      {src:'./assets/photo5.jpg', cap:'То, что хочется запомнить.', rot:-1},
      {src:'./assets/photo6.jpg', cap:'И это только начало.', rot:1, holdExtra:1200},
    ];
    for(const p of photos){
      await showPhoto(p.src, p.cap, {rot:p.rot, holdExtra:p.holdExtra||0});
      await sleep(750);
    }
    await sleep(500);
  }

  /* What's ahead — replaces the old abrupt "365 → ?" entirely. */
  async function sceneFuture(){
    await showLine(textLayer, 'Это уже стало частью истории.', {hold:2400, enter:1200, exit:900});
    await sleep(700);
    await showLine(textLayer, 'А теперь впереди новый год.', {hold:2600, enter:1200, exit:900});
    await sleep(900);

    const orbit = document.createElement('div');
    orbit.className = 'orbit';
    const items = ['мечты','новые места','новые встречи','новые моменты'];
    const pos = [
      {left:'10%', top:'10%'}, {left:'68%', top:'8%'}, {left:'6%', top:'70%'},
      {left:'72%', top:'68%'}
    ];
    textLayer.appendChild(orbit);
    const els = [];
    for(let i=0;i<items.length;i++){
      const w = document.createElement('div');
      w.className = 'orbit-label';
      w.textContent = items[i];
      w.style.left = pos[i].left;
      w.style.top = pos[i].top;
      orbit.appendChild(w);
      els.push(w);
      await sleep(70);
      w.classList.add('enter');
      await sleep(400);
    }
    await sleep(1800);

    await showLine(textLayer, 'Интересно, сколько красивого ещё впереди?', {hold:2400, enter:1200, exit:0, cls:'whisper'});
    els.forEach(w=>{ w.classList.remove('enter'); w.classList.add('exit'); });
    await sleep(800);
    orbit.remove();
    await sleep(300);

    await showLine(textLayer, 'Пусть этот год будет твоим.', {hold:2800, enter:1300, exit:1000, cls:'big'});
    await sleep(900);
  }

  async function sceneGreeting(){
    await showLine(textLayer, 'А если серьёзно&hellip;', {hold:2200, enter:1100, exit:800});
    await sleep(700);

    await showLine(textLayer, `С днём рождения, ${NAME}!`, {hold:2800, enter:1400, exit:1000, cls:'big'});
    await sleep(700);

    await showLine(textLayer,
      'Пусть в этом году будет больше моментов, когда хочется просто улыбнуться в потолок — и больше людей рядом, с которыми легко. А эта новая глава пусть начнётся именно так, как ты давно хотела.',
      {hold:3600, enter:1300, exit:1000});
    await sleep(1000);
  }

  function spawnFinalParticles(){
    for(let i=0;i<16;i++){
      const p = document.createElement('div');
      p.style.cssText = `
        position:absolute; width:3px; height:3px; border-radius:50%;
        left:${10+Math.random()*80}%; top:${20+Math.random()*45}%;
        background:var(--gold-soft);
        box-shadow:0 0 8px 2px rgba(246,220,174,.6);
        opacity:0;
        animation:sparkle-float ${6+Math.random()*5}s ease-in infinite;
        animation-delay:${Math.random()*4}s;
      `;
      finalParticles.appendChild(p);
    }
  }

  async function sceneFinal(){
    // Cake and greeting are ONE composition, centred together as a single
    // block with a small fixed gap — not a cake pinned to the top and text
    // pinned to the bottom of the viewport. The greeting line is created
    // and inserted (invisible) right below the cake before anything
    // animates, so the cake's final position is already correct on frame 1
    // and the text appearing later never shifts it.
    cakeLayer.classList.add('finalCompose');

    clear(finalGreetingEl);
    const greetLine = document.createElement('div');
    greetLine.className = 'line big';
    greetLine.style.setProperty('--enter', '1600ms');
    greetLine.innerHTML = `С днём рождения, ${NAME}! ❤️`;
    finalGreetingEl.appendChild(greetLine); // reserved space now, revealed later

    cakeWrap.style.transition = 'none';
    cakeWrap.style.opacity = '0';
    cakeWrap.style.transform = 'scale(.9)';
    cakeWrap.style.filter = 'blur(12px)';
    buildCandles();
    Array.from(candlesWrap.children).forEach(c => c.classList.add('out'));
    cakeLayer.classList.add('show');
    await sleep(50);
    cakeWrap.style.transition = 'all 1.8s var(--ease)';
    void cakeWrap.offsetWidth;
    cakeWrap.style.opacity = '1';
    cakeWrap.style.transform = 'scale(1)';
    cakeWrap.style.filter = 'blur(0)';
    await sleep(1600);

    await relightCandles(); // one soft flame at a time
    cakeGlow.classList.add('bright');
    spawnFinalParticles();
    await sleep(1000);

    await sleep(200);
    greetLine.classList.add('enter'); // cake does not move — only the text fades in below it
  }

  /* ---------------- Orchestrator ----------------
     Every scene follows ENTER -> HOLD -> EXIT -> GAP -> NEXT ENTER: each
     showLine() call removes its own element only after its exit
     transition has finished, and every scene leaves a short silent gap
     before the next one starts, so nothing overlaps mid-motion. */
  async function run(){
    await sceneIntro();
    await sceneCakeAppears();
    await sceneCountdown();
    await sceneBlowCandles();
    await scene365();
    await scenePhotos();
    await sceneFuture();
    await sceneGreeting();

    await wipeTransition(1500, 1100);
    await sceneFinal();
  }

  run();

})();
