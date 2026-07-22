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

  /* ---- Gallery lightbox ---- */
  var lb = $('#lightbox');
  var lbImg = $('#lightboxImg');
  var lbClose = $('#lightboxClose');
  if (lb && lbImg && typeof lb.showModal === 'function') {
    $$('.gal-item').forEach(function (item) {
      on(item, 'click', function () {
        var src = item.getAttribute('data-full');
        var img = $('img', item);
        lbImg.src = src;
        lbImg.alt = img ? img.alt : '';
        lb.showModal();
      });
    });
    var close = function () { lb.close(); };
    on(lbClose, 'click', close);
    on(lb, 'click', function (e) { if (e.target === lb) close(); });
    on(lb, 'close', function () { lbImg.src = ''; });
  }

  /* ---- Discipline: desktop = rettangoli che si scambiano · mobile = accordion ---- */
  var acc = $('#accordion');
  if (acc) {
    var tiles = $$('.tile', acc);
    var mq = window.matchMedia('(min-width: 821px)');

    // Mobile: accordion (tap per espandere + auto-alternanza)
    var idx = 0;
    var setActive = function (i) {
      idx = (i + tiles.length) % tiles.length;
      tiles.forEach(function (t, j) { t.classList.toggle('active', j === idx); });
    };
    var mobT = null;
    var stopMob = function () { if (mobT) { clearInterval(mobT); mobT = null; } };
    var startMob = function () { if (reduce) return; stopMob(); mobT = setInterval(function () { setActive(idx + 1); }, 4500); };
    tiles.forEach(function (t, i) { on(t, 'click', function () { if (!mq.matches) { setActive(i); startMob(); } }); });

    // Desktop: scambio di posizione tra due riquadri (tecnica FLIP)
    var swapNodes = function (a, b) {
      var p = document.createElement('span');
      a.parentNode.insertBefore(p, a);
      b.parentNode.insertBefore(a, b);
      p.parentNode.insertBefore(b, p);
      p.parentNode.removeChild(p);
    };
    var doSwap = function () {
      var items = $$('.tile', acc);
      if (items.length < 2) return;
      var i = Math.floor(Math.random() * items.length);
      var j = Math.floor(Math.random() * items.length);
      if (i === j) j = (j + 1) % items.length;
      var firsts = items.map(function (el) { return el.getBoundingClientRect(); });
      swapNodes(items[i], items[j]);
      items.forEach(function (el, k) {
        var last = el.getBoundingClientRect();
        var dx = firsts[k].left - last.left, dy = firsts[k].top - last.top;
        if (dx || dy) {
          el.style.transition = 'none';
          el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
          el.getBoundingClientRect();
          requestAnimationFrame(function () {
            el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
            el.style.transform = '';
          });
        }
      });
    };
    var swapT = null;
    var stopSwap = function () { if (swapT) { clearInterval(swapT); swapT = null; } };
    var startSwap = function () { if (reduce) return; stopSwap(); swapT = setInterval(doSwap, 3200); };

    var applyMode = function () {
      if (mq.matches) {
        stopMob();
        tiles.forEach(function (t) { t.classList.remove('active'); });
        startSwap();
      } else {
        stopSwap();
        tiles.forEach(function (t) { t.style.transform = ''; t.style.transition = ''; acc.appendChild(t); });
        setActive(0);
        startMob();
      }
    };
    applyMode();
    if (mq.addEventListener) mq.addEventListener('change', applyMode);
    on(acc, 'mouseenter', function () { if (mq.matches) stopSwap(); });
    on(acc, 'mouseleave', function () { if (mq.matches) startSwap(); });
    on(document, 'visibilitychange', function () {
      if (document.hidden) { stopSwap(); stopMob(); } else { applyMode(); }
    });
  }
})();
