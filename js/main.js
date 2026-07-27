/* Nuova Era — main.js (vanilla, no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var on = function (el, ev, fn, o) { el && el.addEventListener(ev, fn, o); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Footer year ---- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---- Hero slideshow (dissolvenza) ---- */
  var slides = $$('.hero-slide');
  if (slides.length > 1 && !reduce) {
    var si = 0;
    setInterval(function () {
      slides[si].classList.remove('is-active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-active');
    }, 5500);
  }

  /* ---- Header scrolled state ---- */
  var header = $('#siteHeader');
  var onScroll = function () {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  on(window, 'scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = $('#navToggle');
  var closeMenu = function () {
    document.body.classList.remove('menu-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
  };
  on(toggle, 'click', function () {
    var open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  $$('#primaryNav a').forEach(function (a) { on(a, 'click', closeMenu); });
  on(document, 'keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- Reveal on scroll ---- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Scrollspy (active nav link) ---- */
  var navLinks = $$('#primaryNav a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = '#' + en.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Stat counters ---- */
  var stats = $$('.stat-num');
  var runCounter = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target) || reduce) { el.textContent = target + suffix; return; }
    var dur = 1400, start = null;
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('it-IT') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (s) { co.observe(s); });
  } else {
    stats.forEach(function (s) { s.textContent = s.getAttribute('data-count') + (s.getAttribute('data-suffix') || ''); });
  }

  /* ---- Testimonials dots ---- */
  var track = $('#tstTrack');
  var dotsWrap = $('#tstDots');
  if (track && dotsWrap) {
    var cards = $$('.tst-card', track);
    cards.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Vai alla testimonianza ' + (i + 1));
      if (i === 0) b.classList.add('active');
      on(b, 'click', function () {
        track.scrollTo({ left: c.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      });
      dotsWrap.appendChild(b);
    });
    var dots = $$('button', dotsWrap);
    var syncDots = function () {
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      cards.forEach(function (c, i) {
        var cc = c.offsetLeft - track.offsetLeft + c.clientWidth / 2;
        var d = Math.abs(cc - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === best); });
    };
    var raf;
    on(track, 'scroll', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncDots);
    }, { passive: true });
  }

  /* ---- Gallery lightbox (navigabile: frecce, tastiera, swipe) ---- */
  var lb = $('#lightbox');
  var lbImg = $('#lightboxImg');
  if (lb && lbImg && typeof lb.showModal === 'function') {
    var items = $$('.gal-item');
    var lbCount = $('#lightboxCount');
    var cur = 0;
    var show = function (i) {
      cur = (i + items.length) % items.length;
      var item = items[cur];
      lbImg.src = item.getAttribute('data-full');
      var img = $('img', item);
      lbImg.alt = img ? img.alt : '';
      if (lbCount) lbCount.textContent = (cur + 1) + ' / ' + items.length;
    };
    items.forEach(function (item, i) {
      on(item, 'click', function () { show(i); lb.showModal(); });
    });
    on($('#lightboxPrev'), 'click', function (e) { e.stopPropagation(); show(cur - 1); });
    on($('#lightboxNext'), 'click', function (e) { e.stopPropagation(); show(cur + 1); });
    on($('#lightboxClose'), 'click', function () { lb.close(); });
    on(lb, 'click', function (e) { if (e.target === lb) lb.close(); });
    on(lb, 'close', function () { lbImg.src = ''; });
    on(document, 'keydown', function (e) {
      if (!lb.open) return;
      if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
    var sx = null;
    on(lb, 'touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    on(lb, 'touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ---- Discipline: desktop = mosaico che ruota di 1 posizione · mobile = accordion ---- */
  var acc = $('#accordion');
  if (acc) {
    var tiles = $$('.tile', acc);
    var N = tiles.length;
    var mq = window.matchMedia('(min-width: 821px)');

    // Desktop: ogni riquadro avanza di 1 posizione (a turno nel grande, pos0).
    // Mobile: accordion, si apre uno alla volta. Barra countdown sulla foto grande/aperta.
    var offset = 0;
    var ROT_INT = 4200, MOB_INT = 4500;
    var bars = tiles.map(function (t) { return t.querySelector('.tile-bar span'); });
    var resetBars = function () { bars.forEach(function (b) { if (b) { b.style.transition = 'none'; b.style.width = '0%'; } }); };
    var freezeBars = function () { bars.forEach(function (b) { if (b) { var w = getComputedStyle(b).width; b.style.transition = 'none'; b.style.width = w; } }); };
    var fillFeatured = function (dur) {
      resetBars();
      var t = mq.matches ? acc.querySelector('.tile.pos0') : acc.querySelector('.tile.active');
      var b = t ? t.querySelector('.tile-bar span') : null;
      if (!b) return;
      b.getBoundingClientRect();
      b.style.transition = 'width ' + dur + 'ms linear';
      b.style.width = '100%';
    };
    var layout = function () {
      tiles.forEach(function (t, i) {
        for (var p = 0; p < N; p++) t.classList.remove('pos' + p);
        t.classList.add('pos' + ((i + offset) % N));
      });
    };
    var clearPos = function () {
      tiles.forEach(function (t) { for (var p = 0; p < N; p++) t.classList.remove('pos' + p); });
    };
    var rotT = null;
    var stopRot = function () { if (rotT) { clearInterval(rotT); rotT = null; } freezeBars(); };
    var startRot = function () { if (reduce) return; stopRot(); fillFeatured(ROT_INT); rotT = setInterval(function () { offset = (offset + 1) % N; layout(); fillFeatured(ROT_INT); }, ROT_INT); };

    var idx = 0;
    var setActive = function (i) { idx = (i + N) % N; tiles.forEach(function (t, j) { t.classList.toggle('active', j === idx); }); };
    var mobT = null;
    var stopMob = function () { if (mobT) { clearInterval(mobT); mobT = null; } };
    var startMob = function () { if (reduce) return; stopMob(); fillFeatured(MOB_INT); mobT = setInterval(function () { setActive(idx + 1); fillFeatured(MOB_INT); }, MOB_INT); };
    // Click: su mobile apre l'accordion; su desktop porta la tessera nel riquadro grande.
    // Il conteggio resta in pausa finche' il mouse e' sopra, poi riparte da quella scelta.
    tiles.forEach(function (t, i) {
      on(t, 'click', function () {
        if (mq.matches) {
          offset = (N - i) % N;   // cosi' (i + offset) % N === 0 -> questa tessera diventa pos0
          layout();
          resetBars();
        } else {
          setActive(i); startMob();
        }
      });
    });

    var applyMode = function () {
      if (mq.matches) {
        stopMob();
        tiles.forEach(function (t) { t.classList.remove('active'); });
        offset = 0; layout(); startRot();
      } else {
        stopRot();
        clearPos(); resetBars();
        setActive(0); startMob();
      }
    };
    applyMode();
    if (mq.addEventListener) mq.addEventListener('change', applyMode);
    on(acc, 'mouseenter', function () { if (mq.matches) stopRot(); });
    on(acc, 'mouseleave', function () { if (mq.matches) startRot(); });
    on(document, 'visibilitychange', function () {
      if (document.hidden) { stopRot(); stopMob(); } else { applyMode(); }
    });
  }
})();
