/* toburo — живой прототип страницы кейса (демонстрация движения, не продакшн-код). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var tickers = [];

  var css = document.createElement('style');
  css.textContent = '.lv-up{opacity:0;transform:translateY(48px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}.lv-up.in{opacity:1;transform:none}' +
    '.lv-in{animation:lvin 1s cubic-bezier(.2,.8,.2,1) both}@keyframes lvin{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}' +
    '.lv-cover-in{animation:lvcov .9s ease both}@keyframes lvcov{from{opacity:0}to{opacity:1}}' +
    '@media (prefers-reduced-motion: reduce){.lv-up{opacity:1;transform:none;transition:none}.lv-in,.lv-cover-in{animation:none}}';
  document.head.appendChild(css);

  /* обложка: продолжение перехода из списка — вход заголовка, свет следует за курсором */
  var cover = $('section[aria-label="Обложка кейса"]');
  if (cover) {
    cover.classList.add('lv-cover-in');
    var glow = $$('div[aria-hidden="true"]', cover)[0];
    var copy = cover.lastElementChild;
    copy.classList.add('lv-in'); copy.style.animationDelay = '.25s';
    var tx = 0, ty = 0, x = 0, y = 0;
    cover.addEventListener('pointermove', function (e) { var r = cover.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; }, { passive: true });
    tickers.push(function () {
      if (reduce || !glow) return;
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      var p = clamp(-cover.getBoundingClientRect().top / cover.offsetHeight, 0, 1);
      glow.style.transform = 'translate(' + (x * 160) + 'px,' + (y * 100 + p * 140) + 'px) scale(' + (1 + p * 0.6) + ')';
    });
  }

  /* медиа: деформация от скорости скролла + лёгкий параллакс */
  var medias = $$('.ph');
  var lastY = window.scrollY, skew = 0;
  tickers.push(function () {
    var v = window.scrollY - lastY; lastY = window.scrollY;
    skew += (clamp(v * 0.12, -6, 6) - skew) * 0.12;
    if (reduce) return;
    var k = Math.abs(skew) < 0.02 ? 0 : skew;
    medias.forEach(function (m) { m.style.transform = 'skewY(' + k + 'deg)'; });
  });

  /* цифры результата */
  var scramble = function (span) {
    var node = span.firstChild;
    if (!node || node.nodeType !== 3 || node.nodeValue.indexOf('[N]') < 0 || reduce) return;
    var orig = node.nodeValue, t0 = performance.now();
    var run = function (now) {
      if (now - t0 > 1100) { node.nodeValue = orig; return; }
      node.nodeValue = orig.replace('[N]', String(Math.floor(Math.random() * 900) + 100));
      setTimeout(function () { requestAnimationFrame(run); }, 45);
    };
    requestAnimationFrame(run);
  };

  /* появление блоков */
  var ups = [];
  $$('section').forEach(function (s) {
    if (s === cover) return;
    Array.prototype.slice.call(s.children).forEach(function (c) { ups.push(c); });
  });
  var res = $('section[aria-label="Результат в цифрах"]');
  if (!reduce) ups.forEach(function (el, i) { el.classList.add('lv-up'); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (res && res.contains(e.target)) $$('span', e.target).forEach(function (s) { if (/Unbounded/.test(s.style.fontFamily)) scramble(s); });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  ups.forEach(function (el) { io.observe(el); });

  /* следующий кейс: превью тянется за курсором */
  var next = $('section[aria-label="Следующий кейс"] a');
  if (next && !reduce) {
    var pv = next.lastElementChild, nx = 0, ny = 0, sx = 0, sy = 0;
    pv.style.transition = 'none';
    next.addEventListener('pointermove', function (e) { var r = next.getBoundingClientRect(); nx = (e.clientX - r.left) / r.width - 0.5; ny = (e.clientY - r.top) / r.height - 0.5; });
    next.addEventListener('pointerleave', function () { nx = 0; ny = 0; });
    tickers.push(function () { sx += (nx - sx) * 0.1; sy += (ny - sy) * 0.1; pv.style.transform = 'translate(' + (sx * 120) + 'px,' + (sy * 60) + 'px) rotate(' + (sx * 6) + 'deg)'; });
  }

  var loop = function (now) { for (var i = 0; i < tickers.length; i++) tickers[i](now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
