/* toburo — живой прототип главной (демонстрация движения, не продакшн-код).
   Работает поверх статичной разметки макета: ничего в макете не меняет, если JS не загрузился. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var vh = function () { return window.innerHeight; };

  var css = document.createElement('style');
  css.textContent = [
    '.lv-up{opacity:0;transform:translateY(48px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}',
    '.lv-up.in{opacity:1;transform:none}',
    '.lv-loader{position:fixed;inset:0;z-index:200;background:#303030;perspective:700px;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease}',
    '.lv-seal{--s:230px;margin:0;color:#EFEBE4}',
    '.lv-seal .ring{stroke-dasharray:604;animation:ldring .6s ease both}',
    '@keyframes ldring{from{stroke-dashoffset:604}to{stroke-dashoffset:0}}',
    '.lv-seal .seal-txt{opacity:0;animation:ldtxt .5s ease .3s both,sealspin 48s linear infinite}',
    '@keyframes ldtxt{to{opacity:1}}',
    '.lv-stamp{position:absolute;inset:0;animation:ldstamp .45s cubic-bezier(.5,0,.3,1) .6s both}',
    '@keyframes ldstamp{0%{opacity:0;transform:scale(1.7) rotate(-14deg)}70%{opacity:1;transform:scale(.94) rotate(0)}100%{opacity:1;transform:scale(1)}}',
    '.lv-ink{position:absolute;left:50%;top:50%;width:64%;height:64%;margin:-32% 0 0 -32%;border-radius:50%;border:2px solid #B8AEA0;opacity:0;animation:ldink .7s ease-out .95s both}',
    '@keyframes ldink{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}',
    '@keyframes lvsealspin{to{transform:rotate(360deg)}}',
    'a:hover .seal-mini svg{animation:lvsealspin .9s cubic-bezier(.2,.8,.2,1)}',
    '@keyframes lvspin{to{transform:rotateY(360deg)}}',
    '.lv-loader > b{position:absolute;right:40px;bottom:32px;font:500 14px "JetBrains Mono",monospace;color:#9C9A94}',
    '.lv-loader > .lv-cap{position:absolute;left:40px;bottom:32px;font:500 12px "JetBrains Mono",monospace;letter-spacing:.14em;color:#9C9A94}',
    '.lv-cursor{position:fixed;left:0;top:0;z-index:150;pointer-events:none;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;background:#576257;color:#EFEBE4;display:flex;align-items:center;justify-content:center;font:600 14px Onest,sans-serif;transform:scale(0);transition:transform .35s cubic-bezier(.2,.8,.2,1)}',
    '.lv-cursor.on{transform:scale(1)}',
    '.lv-sticky{position:fixed;right:24px;bottom:24px;z-index:120;width:96px;height:96px;border-radius:50%;background:#576257;color:#EFEBE4!important;display:flex;align-items:center;justify-content:center;font:700 15px "TT Travels Next",Unbounded,sans-serif;letter-spacing:-.02em;text-decoration:none;transform:scale(0);transition:transform .45s cubic-bezier(.2,.8,.2,1)}',
    '.lv-sticky.on{transform:scale(1)}.lv-sticky.on:hover{transform:scale(1.08)}',
    '.lv-sticky:focus-visible{outline:2px solid #303030;outline-offset:4px}',
    '@media (max-width:700px){.lv-sticky{width:64px;height:64px;font-size:12px;right:16px;bottom:16px}}',
    '.lv-mq{display:flex;gap:16px;width:max-content;margin-left:0!important;animation:lvmq 45s linear infinite}',
    '.lv-mq.rev{animation-direction:reverse}',
    '@keyframes lvmq{to{transform:translateX(-50%)}}',
    '.lv-w{transition:color .35s ease}',
    '.lv-row-head{cursor:pointer}.lv-row-head:focus-visible{outline:2px solid #576257;outline-offset:4px}',
    '.lv-title{transition:transform .5s cubic-bezier(.2,.8,.2,1),color .3s}',
    '.lv-wrap{transition:opacity .35s ease}',
    '.lv-det{overflow:hidden;max-height:0;box-sizing:border-box;transition:max-height .6s cubic-bezier(.2,.8,.2,1)}',
    '.lv-scroller{scrollbar-width:none;cursor:grab}.lv-scroller::-webkit-scrollbar{display:none}',
    '.lv-scroller.drag{cursor:grabbing}',
    '.lv-card-media{will-change:transform;transition:transform .6s cubic-bezier(.2,.8,.2,1)}',
    '.lv-talent>div:first-child{transition:transform .45s cubic-bezier(.2,.8,.2,1)}.lv-talent:hover>div:first-child{transform:translateY(-10px)}',
    '.lv-flip{position:fixed;z-index:180;transition:left .75s cubic-bezier(.7,0,.2,1),top .75s cubic-bezier(.7,0,.2,1),width .75s cubic-bezier(.7,0,.2,1),height .75s cubic-bezier(.7,0,.2,1)}',
    '@media (prefers-reduced-motion: reduce){.lv-up{opacity:1;transform:none;transition:none}.lv-mq{animation:none}}'
  ].join('\n');
  document.head.appendChild(css);

  var root = document.body.firstElementChild;
  var hero = $('section[aria-label="Первый экран"]');
  var manifest = $('section[aria-label="Манифест"]');
  var services = $('#services');
  var cases = $('#cases');
  var talents = $('#talents');
  var numbers = $('section[aria-label="Цифры"]');
  var clients = $('section[aria-label="Клиенты и партнёры"]');
  var process = $('section[aria-label="Как мы работаем"]');
  var brief = $('#brief');
  var foot = $('#contacts');
  var tickers = [];

  /* ---------- курсор-кружок «Смотреть» ---------- */
  var cur = document.createElement('div');
  cur.className = 'lv-cursor'; cur.setAttribute('aria-hidden', 'true'); cur.textContent = 'Смотреть';
  document.body.appendChild(cur);
  var cx = 0, cy = 0, ccx = 0, ccy = 0;
  window.addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
  tickers.push(function () { ccx += (cx - ccx) * 0.2; ccy += (cy - ccy) * 0.2; cur.style.left = ccx + 'px'; cur.style.top = ccy + 'px'; });

  /* ---------- hero: прожектор ---------- */
  var heroIntro = function () {};
  if (hero) {
    var hk = hero.children, grid = hk[0], dark = hk[1], ring = hk[2];
    grid.style.inset = '-28px';
    var tx = 0.6, ty = 0.34, x = 0.6, y = 0.34, last = -1e9, on = reduce ? 1 : 0, onT = reduce ? 1 : 0;
    var point = function (px, py) { var r = hero.getBoundingClientRect(); tx = (px - r.left) / r.width; ty = (py - r.top) / r.height; last = performance.now(); };
    hero.addEventListener('pointermove', function (e) { point(e.clientX, e.clientY); }, { passive: true });
    hero.addEventListener('touchmove', function (e) { if (e.touches[0]) point(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    var copy = hero.lastElementChild;
    var h1 = $('h1', hero);
    if (!reduce) { copy.classList.add('lv-up'); }
    heroIntro = function () { onT = 1; setTimeout(function () { copy.classList.add('in'); }, 250); };
    tickers.push(function (now) {
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0) return;
      if (!reduce && now - last > 2500) { var s = now / 1000; tx = 0.55 + 0.3 * Math.sin(s * 0.45); ty = 0.36 + 0.18 * Math.sin(s * 0.8 + 1); }
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      on += (onT - on) * 0.06;
      var p = clamp(-r.top / r.height, 0, 1);
      var rad = Math.max(0.1, 270 * on * (1 - 0.9 * ease(p)));
      dark.style.background = 'radial-gradient(circle ' + rad + 'px at ' + (x * 100) + '% ' + (y * 100) + '%, rgba(48,48,48,0) 0%, rgba(48,48,48,0.45) 55%, rgba(48,48,48,0.97) 100%)';
      ring.style.left = (x * 100) + '%'; ring.style.top = (y * 100) + '%'; ring.style.opacity = on * (1 - p);
      grid.style.transform = 'translate(' + ((0.5 - x) * 40) + 'px,' + ((0.5 - y) * 26 + p * 120) + 'px)';
      if (h1) h1.style.transform = 'translateY(' + (-p * 80) + 'px)';
    });
  }

  /* ---------- лоадер: «!» включается как прожектор ---------- */
  if (!reduce) {
    var lcss = document.createElement('style');
    lcss.textContent = [
      '.lv-lg{font-size:clamp(64px,10vw,132px);color:#EFEBE4;position:relative;z-index:1}',
      '.lv-lg .ex-stem{animation:lvstem .5s cubic-bezier(.6,0,.2,1) both}',
      '@keyframes lvstem{from{transform:scaleY(0)}to{transform:scaleY(1)}}',
      '.lv-lg .ex-dot{animation:lvdot .55s cubic-bezier(.5,0,.6,1.6) .4s both}',
      '@keyframes lvdot{0%{opacity:0;transform:translateY(-420%)}60%{opacity:1}100%{opacity:1;transform:none}}',
      '.lv-lg .lg-to{animation:lvto .5s cubic-bezier(.2,.8,.2,1) 1.05s both}',
      '.lv-lg .lg-buro{animation:lvburo .5s cubic-bezier(.2,.8,.2,1) 1.05s both}',
      '@keyframes lvto{from{opacity:0;clip-path:inset(0 0 0 100%);transform:translateX(40%)}to{opacity:1;clip-path:inset(0);transform:none}}',
      '@keyframes lvburo{from{opacity:0;clip-path:inset(0 100% 0 0);transform:translateX(-25%)}to{opacity:1;clip-path:inset(0);transform:none}}',
      '.lv-glow{position:absolute;left:50%;top:50%;width:560px;height:560px;margin:-280px 0 0 -280px;border-radius:50%;background:radial-gradient(circle,rgba(184,174,160,.3) 0%,rgba(184,174,160,0) 62%);animation:lvglow .7s ease .8s both}',
      '@keyframes lvglow{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}'
    ].join('\n');
    document.head.appendChild(lcss);
    var ld = document.createElement('div');
    ld.className = 'lv-loader';
    var hl = hero && $('.lg', hero);
    ld.innerHTML = '<div class="lv-glow" aria-hidden="true"></div>' + (hl ? hl.outerHTML.replace('class="lg"', 'class="lg lv-lg" aria-hidden="true"') : '') + '<b>000</b><span class="lv-cap">ТО!БЮРО · ВКЛЮЧАЕМ СВЕТ</span>';
    document.body.appendChild(ld);
    document.documentElement.style.overflow = 'hidden';
    var t0 = performance.now(), cnt = ld.querySelector('b');
    var tick = function (now) {
      var p = clamp((now - t0) / 2000, 0, 1);
      cnt.textContent = String(Math.floor(p * 100)).padStart(3, '0');
      if (p < 1) { requestAnimationFrame(tick); return; }
      ld.style.opacity = 0;
      document.documentElement.style.overflow = '';
      heroIntro();
      setTimeout(function () { ld.remove(); }, 700);
    };
    requestAnimationFrame(tick);
  } else { heroIntro(); }

  /* ---------- манифест: проявление по словам ---------- */
  if (manifest) {
    var mp = $('p', manifest);
    var words = mp.textContent.trim().split(/\s+/);
    mp.textContent = '';
    var spans = words.map(function (w, i) {
      var s = document.createElement('span'); s.className = 'lv-w'; s.textContent = w;
      mp.appendChild(s); if (i < words.length - 1) mp.appendChild(document.createTextNode(' '));
      return s;
    });
    var lit = -1;
    tickers.push(function () {
      var r = mp.getBoundingClientRect();
      var p = reduce ? 1 : clamp((vh() * 0.85 - r.top) / (r.height + vh() * 0.35), 0, 1);
      var n = Math.round(p * spans.length);
      if (n === lit) return; lit = n;
      spans.forEach(function (s, i) { s.style.color = i < n ? '#303030' : 'rgba(48,48,48,0.18)'; });
    });
  }

  /* ---------- услуги: hover-видео за курсором + раскрытие ---------- */
  if (services) {
    var sk = Array.prototype.slice.call(services.children);
    var prev = sk[4];
    var rows = sk.slice(1, 4);
    var tpl = rows[0].children[1];
    var data = [null,
      { a: ['Концепция и режиссура события', 'Площадки и подрядчики из проверенной сети'], b: ['Гости, звёзды и партнёры', 'Освещение в соцсетях до, во время и после'], cta: 'Бриф на ивент' },
      { a: ['Креативная идея кампании', 'Фото- и видеосъёмки'], b: ['Контент для соцсетей', 'Адаптации под форматы и площадки'], cta: 'Бриф на продакшн' }];
    var wraps = rows.map(function (row, i) {
      if (i === 0) return row;
      var w = document.createElement('div');
      w.style.borderTop = row.style.borderTop;
      if (row.style.borderBottom) { w.style.borderBottom = row.style.borderBottom; row.style.borderBottom = ''; }
      row.style.borderTop = ''; row.style.opacity = '';
      row.parentNode.insertBefore(w, row); w.appendChild(row);
      var det = tpl.cloneNode(true);
      var uls = $$('ul', det);
      uls[0].innerHTML = ''; uls[1].innerHTML = '';
      data[i].a.forEach(function (t) { var li = document.createElement('li'); li.textContent = '— ' + t; uls[0].appendChild(li); });
      data[i].b.forEach(function (t) { var li = document.createElement('li'); li.textContent = '— ' + t; uls[1].appendChild(li); });
      $('a', det).textContent = data[i].cta;
      w.appendChild(det);
      return w;
    });
    var heads = wraps.map(function (w) { return w.children[0]; });
    var dets = wraps.map(function (w) { return w.children[1]; });
    var hover = -1, open = -1;
    var paint = function () {
      wraps.forEach(function (w, i) {
        var title = heads[i].children[1], icon = heads[i].children[3];
        w.style.opacity = (hover === -1 || hover === i || open === i) ? 1 : 0.32;
        title.style.transform = (hover === i || open === i) ? 'translateX(24px)' : 'none';
        title.style.color = open === i ? '#576257' : '#303030';
        icon.textContent = open === i ? '−' : '+';
        icon.style.borderColor = open === i ? '#576257' : 'rgba(48,48,48,0.4)';
        icon.style.color = open === i ? '#576257' : '#303030';
        dets[i].style.paddingBottom = open === i ? '40px' : '0px';
        dets[i].style.maxHeight = open === i ? (dets[i].scrollHeight + 40) + 'px' : '0px';
        heads[i].setAttribute('aria-expanded', open === i ? 'true' : 'false');
      });
      prev.style.opacity = (fine && !reduce && hover !== -1 && hover !== open) ? 1 : 0;
      if (hover !== -1) {
        prev.style.background = ['#4D524B', '#44484F', '#54493F'][hover];
        prev.lastElementChild.textContent = ['ВИДЕО-ЛУП 4:5 · нарезка выходов блогеров', 'ВИДЕО-ЛУП 4:5 · гости, свет, сцена', 'ВИДЕО-ЛУП 4:5 · бэкстейдж съёмки'][hover];
      }
    };
    wraps.forEach(function (w, i) {
      w.classList.add('lv-wrap');
      dets[i].classList.add('lv-det');
      heads[i].classList.add('lv-row-head');
      heads[i].children[1].classList.add('lv-title');
      heads[i].setAttribute('role', 'button'); heads[i].tabIndex = 0;
      w.addEventListener('mouseenter', function () { hover = i; paint(); });
      var toggle = function () { open = open === i ? -1 : i; paint(); };
      heads[i].addEventListener('click', toggle);
      heads[i].addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    services.addEventListener('mouseleave', function () { hover = -1; paint(); });
    prev.style.right = 'auto'; prev.style.left = '0'; prev.style.top = '0'; prev.style.opacity = 0;
    prev.style.transition = 'opacity .3s ease'; prev.style.pointerEvents = 'none'; prev.style.zIndex = 3;
    var px = 0, py = 0, ppx = 0, ppy = 0, rot = 0, t1 = performance.now();
    services.addEventListener('pointermove', function (e) { var r = services.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; }, { passive: true });
    var rec = prev.children[0];
    tickers.push(function (now) {
      var nx = ppx + (px - ppx) * 0.14, vx = nx - ppx; ppx = nx; ppy += (py - ppy) * 0.14;
      rot += (clamp(vx * 0.5, -12, 12) - rot) * 0.15;
      prev.style.transform = 'translate(' + (ppx - 120) + 'px,' + (ppy - 150) + 'px) rotate(' + rot + 'deg)';
      var s = Math.floor((now - t1) / 1000);
      rec.lastChild.nodeValue = '00:' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    });
    paint();
  }

  /* ---------- кейсы: лента с drag, без перехода в детальные кейсы ---------- */
  var medias = [];
  if (cases) {
    var scroller = cases.children[1];
    scroller.classList.add('lv-scroller');
    var cards = Array.prototype.slice.call(scroller.children);
    cards.forEach(function (c) { var m = c.firstElementChild; m.classList.add('lv-card-media'); medias.push(m); });
    var down = false, moved = 0, sx = 0, sl = 0;
    scroller.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = scroller.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); scroller.scrollLeft = sl - dx; if (moved > 4) scroller.classList.add('drag'); });
    window.addEventListener('pointerup', function () { down = false; scroller.classList.remove('drag'); });
    scroller.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* ---------- скорость скролла -> деформация медиа ---------- */
  var lastY = window.scrollY, skew = 0;
  tickers.push(function () {
    var v = window.scrollY - lastY; lastY = window.scrollY;
    skew += (clamp(v * 0.12, -6, 6) - skew) * 0.12;
    if (reduce) return;
    var k = Math.abs(skew) < 0.02 ? 0 : skew;
    medias.forEach(function (m) { m.style.transform = 'skewY(' + k + 'deg) scale(' + (1 - Math.abs(k) * 0.006) + ')'; });
  });

  /* ---------- сеть талантов ---------- */
  if (talents) {
    var svg = $('svg', talents);
    var tcards = $$('div > div > div', talents).filter(function (d) { return d.parentElement && d.parentElement.style.display === 'grid'; });
    tcards.forEach(function (c, i) { c.classList.add('lv-talent', 'lv-up'); c.style.transitionDelay = (i * 70) + 'ms'; });
    var nx2 = 0, ny2 = 0, sx2 = 0, sy2 = 0;
    talents.addEventListener('pointermove', function (e) { var r = talents.getBoundingClientRect(); nx2 = (e.clientX - r.left) / r.width - 0.5; ny2 = (e.clientY - r.top) / r.height - 0.5; }, { passive: true });
    tickers.push(function () { sx2 += (nx2 - sx2) * 0.06; sy2 += (ny2 - sy2) * 0.06; svg.style.transform = 'translate(' + (sx2 * -40) + 'px,' + (sy2 * -30) + 'px) scale(1.06)'; });
  }

  /* ---------- цифры: «прокрутка» разрядов ---------- */
  var scramble = function (span) {
    var node = span.firstChild;
    if (!node || node.nodeType !== 3 || span.dataset.done) return;
    span.dataset.done = '1';
    var orig = node.nodeValue, m = orig.match(/^(\d+)/);
    if (!m || reduce) return;
    var target = +m[1], t0 = performance.now();
    var run = function (now) {
      var p = clamp((now - t0) / 1200, 0, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = orig.replace(m[1], String(Math.round(target * e)));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  };

  /* ---------- клиенты: бегущая строка ---------- */
  if (clients) {
    var mrows = Array.prototype.slice.call(clients.children).slice(1);
    mrows.forEach(function (row, i) {
      $$('span', row).forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });
      row.classList.add('lv-mq'); if (i % 2) row.classList.add('rev');
    });
  }

  /* ---------- процесс: линия рисуется по скроллу ---------- */
  if (process) {
    var lineWrap = process.children[1], line = lineWrap.children[1];
    var pdots = $$('ol > li > span:first-child', process);
    line.style.transition = 'none';
    tickers.push(function () {
      var r = process.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh()) return;
      var p = reduce ? 1 : clamp((vh() * 0.8 - r.top) / (r.height * 0.75), 0, 1);
      line.style.width = (p * 100) + '%';
      pdots.forEach(function (d, i) {
        var hit = p >= (i / pdots.length) + 0.02 || (i === 0 && p > 0.02);
        d.style.background = hit ? '#576257' : '#EFEBE4';
        d.style.border = hit ? '0' : '1.5px solid #8C877E';
        d.style.boxSizing = 'border-box';
        d.style.transform = hit ? 'scale(1.3)' : 'scale(1)';
        d.style.transition = 'transform .3s, background .3s';
      });
    });
  }

  /* ---------- бриф: четыре шага прямо на главной ---------- */
  if (brief) {
    var col = brief.firstElementChild.children[1];
    var bars = Array.prototype.slice.call(col.children[0].children);
    var qEl = col.children[1], body = col.children[2], nav = col.children[3];
    var nextBtn = $('.brief-next', nav), stepLbl = nav.lastElementChild;
    var chipStyle = body.firstElementChild.getAttribute('style').replace(/background: #EFEBE4; color: #303030; border: 1.5px solid #EFEBE4/, 'background: transparent; color: #EFEBE4; border: 1.5px solid #EFEBE4');
    var steps = [
      { q: 'Что нужно бренду?', multi: true, opts: ['Инфлюенс', 'Ивент', 'Продакшн', 'Всё вместе'] },
      { q: 'Какой бюджет закладываете?', opts: ['до 500 тыс. ₽', '0,5–1,5 млн ₽', '1,5–5 млн ₽', 'от 5 млн ₽', 'Пока не знаем'] },
      { q: 'Когда запускаемся?', opts: ['Срочно, до 2 недель', 'В течение месяца', 'Через 1–3 месяца', 'Сроки гибкие'] },
      { q: 'Как с вами связаться?', form: true }
    ];
    var picked = [{ 'Инфлюенс': true }, {}, {}, {}], step = 0;
    var back = document.createElement('button');
    back.type = 'button'; back.textContent = '← Назад';
    back.setAttribute('style', 'background: transparent; color: #EFEBE4; border: 1.5px solid rgba(239,235,228,.6); padding: 16px 24px; border-radius: 999px; font: 600 16px Onest, sans-serif; cursor: pointer');
    nav.insertBefore(back, nextBtn);
    var fieldCss = 'height:52px;background:transparent;border:0;border-bottom:1.5px solid rgba(239,235,228,.6);color:#EFEBE4;font:400 18px Onest,sans-serif;outline:none;width:100%';
    var render = function () {
      bars.forEach(function (b, i) { b.style.background = i <= step ? '#EFEBE4' : 'rgba(239,235,228,0.3)'; });
      back.style.visibility = step > 0 && step < 4 ? 'visible' : 'hidden';
      body.innerHTML = '';
      if (step === 4) {
        qEl.textContent = 'Бриф у нас!';
        body.style.display = 'block';
        body.innerHTML = '<p style="margin:0;font-size:18px;line-height:1.5;max-width:460px">Ответим в течение рабочего дня с идеями и оценкой. Если горит — пишите в Telegram.</p>';
        nav.style.display = 'none';
        return;
      }
      var s = steps[step];
      qEl.textContent = s.q;
      stepLbl.textContent = 'ШАГ ' + (step + 1) + ' / 4';
      nextBtn.textContent = step === 3 ? 'Отправить бриф →' : 'Дальше →';
      body.style.display = 'grid';
      if (s.form) {
        [['Имя *', 'name'], ['Telegram или телефон *', 'contact'], ['Бренд или компания', 'company'], ['Email', 'email']].forEach(function (f) {
          var w = document.createElement('label');
          w.setAttribute('style', 'display:flex;flex-direction:column;gap:8px;font-size:13px;color:#E3DDD3');
          w.textContent = f[0];
          var inp = document.createElement('input'); inp.name = f[1]; inp.setAttribute('style', fieldCss);
          w.appendChild(inp); body.appendChild(w);
        });
        var c = document.createElement('label');
        c.setAttribute('style', 'grid-column:1/-1;display:flex;gap:12px;align-items:center;font-size:14px;color:#E3DDD3');
        c.innerHTML = '<input type="checkbox" name="consent" style="width:20px;height:20px;accent-color:#EFEBE4;margin:0">Согласен на обработку персональных данных *';
        body.appendChild(c);
        return;
      }
      s.opts.forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = o; b.setAttribute('style', chipStyle);
        var on = !!picked[step][o];
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) { b.style.background = '#EFEBE4'; b.style.color = '#303030'; }
        b.addEventListener('click', function () {
          if (!s.multi) picked[step] = {};
          picked[step][o] = !picked[step][o];
          render();
        });
        body.appendChild(b);
      });
    };
    nextBtn.addEventListener('click', function () {
      if (step === 3) {
        var n = $('input[name=name]', body), k = $('input[name=contact]', body), ok = $('input[name=consent]', body);
        var bad = false;
        [n, k].forEach(function (i) { var e = !i.value.trim(); i.style.borderBottomColor = e ? '#FFB4A2' : 'rgba(239,235,228,.6)'; bad = bad || e; });
        if (bad || !ok.checked) { stepLbl.textContent = 'Заполните имя, контакт и согласие'; return; }
      }
      step = Math.min(4, step + 1); render();
    });
    back.addEventListener('click', function () { step = Math.max(0, step - 1); render(); });
    render();
  }

  /* ---------- футер-reveal: «!» падает на место ---------- */
  var mark = null;
  if (foot && foot.previousElementSibling) {
    root.style.overflow = 'clip';
    var before = foot.previousElementSibling;
    var canReveal = function () { return foot.offsetHeight < vh() - 40; };
    $$(':scope > section', root).forEach(function (s) {
      s.style.position = s.style.position || 'relative';
      s.style.zIndex = '1';
      var bg = getComputedStyle(s).backgroundColor;
      if (bg === 'rgba(0, 0, 0, 0)') bg = '#EFEBE4';
      s.style.background = bg;
      // фон на всю ширину окна, даже если сама секция уже 1440 px
      s.style.boxShadow = '0 0 0 100vmax ' + bg;
      s.style.clipPath = 'inset(0 -100vmax)';
    });
    var applyReveal = function () { if (canReveal()) { foot.style.position = 'sticky'; foot.style.bottom = '0'; foot.style.zIndex = '0'; } else { foot.style.position = ''; } };
    applyReveal(); window.addEventListener('resize', applyReveal);
    var ex = $('.lg .lg-ex', foot);
    mark = ex && ex.closest('.lg');
    var dot = ex && $('.ex-dot', ex), stem = ex && $('.ex-stem', ex);
    tickers.push(function () {
      if (!mark) return;
      var fh = foot.offsetHeight, b = before.getBoundingClientRect().bottom;
      var p = reduce ? 1 : clamp(1 - (b - (vh() - fh)) / fh, 0, 1);
      mark.style.transform = 'translateY(' + ((1 - p) * 60) + 'px)';
      stem.style.transform = 'scaleY(' + clamp(p * 1.6, 0, 1) + ')';
      var d = clamp((p - 0.45) / 0.55, 0, 1);
      dot.style.transform = 'translateY(' + ((1 - ease(d)) * -380) + '%)';
      dot.style.opacity = d > 0 ? 1 : 0;
    });
  }

  /* ---------- стоковые фото вместо плейсхолдеров (Unsplash, медленный «Ken Burns») ---------- */
  var U = function (id, w) { return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&q=70'; };
  var mcss = document.createElement('style');
  mcss.textContent = '.lv-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .8s ease;animation:lvkb 18s ease-in-out infinite alternate;will-change:transform}' +
    '.lv-img.ok{opacity:1}@keyframes lvkb{from{transform:scale(1.02)}to{transform:scale(1.14) translate(-2%,-1.5%)}}' +
    '.lv-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(48,48,48,0) 55%,rgba(48,48,48,.55) 100%)}' +
    '@media (prefers-reduced-motion: reduce){.lv-img{animation:none}}';
  document.head.appendChild(mcss);
  var photo = function (el, id, w, opts) {
    if (!el) return;
    opts = opts || {};
    var im = new Image();
    im.onload = function () {
      if (opts.clear) Array.prototype.slice.call(el.children).forEach(function (c) { if (!/position: absolute/.test(c.getAttribute('style') || '') || opts.clearAll) c.style.display = 'none'; });
      var d = document.createElement('div'); d.className = 'lv-img'; d.style.backgroundImage = 'url(' + im.src + ')';
      if (opts.filter) d.style.filter = opts.filter;
      d.style.animationDelay = (-Math.random() * 18) + 's';
      el.style.position = el.style.position || 'relative'; el.style.overflow = 'hidden';
      el.insertBefore(d, el.firstChild);
      if (opts.shade) { var sh = document.createElement('div'); sh.className = 'lv-shade'; el.insertBefore(sh, d.nextSibling); }
      $$('span', el).forEach(function (s) { if (/ВИДЕО-ЛУП|^кадр|лицо кампании|новая звезда$|ивент|съёмка|продакшн/i.test(s.textContent) && !/background/.test(s.getAttribute('style') || '')) s.style.display = 'none'; });
      requestAnimationFrame(function () { d.classList.add('ok'); });
    };
    im.src = U(id, w);
  };
  if (hero) {
    var HERO = ['1515138692129-197a2c608cfd', '1470229722913-7c0e2dbbafd3', '1612544409025-e1f6a56c1152', '1506863530036-1efeddceb993', '1540039155733-5bb30b53aa14', '1759532338598-679140538775',
      '1517457373958-b7bdd4587205', '1532170579297-281918c8ae72', '1594394489098-74ac04c0fc2e', '1730320784493-786d61fef781', '1459749411175-04bf5292ceea', '1758613655874-69eef9eee0a4',
      '1514525253161-7a46d19cd819', '1622427479715-4f2b1f320707', '1485846234645-a62644f84728', '1645730826845-cd2ddec9984f', '1543479138-27bdf499e851', '1611784728558-6c7d9b409cdf'];
    Array.prototype.slice.call(hero.children[0].children).forEach(function (t, i) { photo(t, HERO[i % HERO.length], 600, { clear: true, clearAll: true, filter: 'saturate(.75) contrast(1.05)' }); });
  }
  if (cases) {
    var CASES = ['1730320784834-2a296bc92053', '1603910234616-3b5f4a6be2b4', '1758613656229-d7434bf4b7ea', '1509824227185-9c5a01ceba0d'];
    medias.forEach(function (m, i) { photo(m, CASES[i % CASES.length], 900, { shade: true }); });
  }
  if (talents) {
    var TAL = ['1730320995772-2dbf630b82cd', '1532074205216-d0e1f4b87368', '1667053508464-eb11b394df83', '1730320870329-616a2fe8a8e8', '1634510979979-4be6881d31bb', '1738511980236-c670a95a3970'];
    $$('.lv-talent', talents).forEach(function (c, i) { photo(c.firstElementChild, TAL[i % TAL.length], 600, { clear: true }); });
  }
  if (services) {
    var SV = [['1532171875345-9712d9d4f65a', '1695408247109-3bf125ad0538'], ['1540039155733-5bb30b53aa14', '1699730164892-d7c433524ff3'], ['1612544409025-e1f6a56c1152', '1758613654707-8bdab92f711d']];
    var prevEl = services.lastElementChild;
    var layers = SV.map(function (pair) {
      var d = document.createElement('div'); d.className = 'lv-img'; d.style.backgroundImage = 'url(' + U(pair[0], 600) + ')'; d.style.transition = 'opacity .35s ease';
      prevEl.insertBefore(d, prevEl.firstChild); return d;
    });
    var shade = document.createElement('div'); shade.className = 'lv-shade'; prevEl.insertBefore(shade, layers[layers.length - 1].nextSibling);
    $$('div, span', prevEl).forEach(function (el) { if (/^луп$|ВИДЕО-ЛУП/.test(el.textContent.trim()) && !el.querySelector('div')) el.style.display = 'none'; });
    var lastBg = '';
    tickers.push(function () {
      var bg = prevEl.style.background;
      if (bg === lastBg) return; lastBg = bg;
      var idx = ['rgb(77, 82, 75)', 'rgb(68, 72, 79)', 'rgb(84, 73, 63)'].indexOf(prevEl.style.backgroundColor);
      layers.forEach(function (l, i) { l.classList.toggle('ok', i === idx); });
    });
  }

  /* ---------- липкая кнопка «бриф» ---------- */
  var st = document.createElement('a');
  st.className = 'lv-sticky'; st.href = '#brief'; st.textContent = 'бриф'; st.setAttribute('aria-label', 'Заполнить бриф');
  document.body.appendChild(st);
  tickers.push(function () {
    var show = hero && brief && window.scrollY > hero.offsetHeight * 0.8 && brief.getBoundingClientRect().top > vh() * 0.85;
    st.classList.toggle('on', !!show);
  });

  /* ---------- появление блоков ---------- */
  var ups = [];
  [services, cases, talents, numbers, clients, process, brief].forEach(function (s) {
    if (!s) return;
    var first = s === talents ? s.children[1] && s.children[1].children[0] : s.children[0];
    if (first) ups.push(first);
  });
  if (numbers) $$(':scope > div', numbers).forEach(function (d, i) { d.style.transitionDelay = (i * 90) + 'ms'; ups.push(d); });
  if (process) $$('ol > li', process).forEach(function (d, i) { d.style.transitionDelay = (i * 110) + 'ms'; ups.push(d); });
  if (!reduce) ups.forEach(function (el) { el.classList.add('lv-up'); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (numbers && numbers.contains(e.target)) scramble(e.target.firstElementChild);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  ups.concat($$('.lv-talent')).forEach(function (el) { io.observe(el); });

  /* ---------- общий цикл ---------- */
  var loop = function (now) { for (var i = 0; i < tickers.length; i++) tickers[i](now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
