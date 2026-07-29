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
  /* la striscia di sito lasciata scoperta chiude il menu se toccata */
  on($('#navVelo'), 'click', closeMenu);
  /* ...oppure trascinando il pannello verso destra */
  var nav = $('#primaryNav'), tocco = null;
  on(nav, 'touchstart', function (e) { tocco = e.touches[0].clientX; }, { passive: true });
  on(nav, 'touchend', function (e) {
    if (tocco === null) return;
    if (e.changedTouches[0].clientX - tocco > 60) closeMenu();
    tocco = null;
  }, { passive: true });

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

  /* ---- Schede maestri: su desktop gira col mouse (CSS), su touch col tocco ----
     Sul touch la scheda torna da sola dopo qualche secondo, e aprirne una
     richiude quella eventualmente gia' aperta. */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var teamCards = $$('.team-card.has-photo');
  var RITORNO = 2000;
  var flipTimer = null;
  var chiudiTutte = function () {
    if (flipTimer) { clearTimeout(flipTimer); flipTimer = null; }
    teamCards.forEach(function (x) { x.classList.remove('flipped'); });
  };
  teamCards.forEach(function (c) {
    on(c, 'click', function () {
      if (canHover.matches) return;              // su desktop ci pensa l'hover
      var eraAperta = c.classList.contains('flipped');
      chiudiTutte();
      if (!eraAperta) {
        c.classList.add('flipped');
        flipTimer = setTimeout(chiudiTutte, RITORNO);
      }
    });
  });
  /* toccando altrove si richiude subito */
  on(document, 'click', function (e) {
    if (!canHover.matches && !e.target.closest('.team-card')) chiudiTutte();
  });


  /* ---- Ballerini che completano una presa seguendo lo scorrimento ----------
     Armatura a segmenti: ogni arto ha angoli propri, interpolati fra pose
     chiave. Cosi' il movimento e' continuo e legato al punto esatto di
     scorrimento, non una sequenza di disegni fissi. */
  var LIME = '#C6D62E', VERM = '#E23C24';

  function pt(x, y, ang, len) {
    var r = ang * Math.PI / 180;
    return [x + len * Math.sin(r), y - len * Math.cos(r)];
  }

  /* Misure del corpo, in unita' del viewBox */
  var B = { torso: 24, collo: 4.5, testa: 7.6, omero: 12, avamb: 11.5, coscia: 13.5, tibia: 13 };

  /* Calcola tutti i punti di un ballerino a partire dai suoi angoli */
  function scheletro(p) {
    var hip = p.hip;
    var sh  = pt(hip[0], hip[1], p.busto, B.torso);
    var col = pt(sh[0], sh[1], p.busto + (p.testa || 0), B.collo);
    var cap = pt(col[0], col[1], p.busto + (p.testa || 0), B.testa * 0.85);
    var gom = {}, man = {}, gin = {}, pie = {};
    ['sx', 'dx'].forEach(function (k) {
      var a = p['braccio' + k];
      gom[k] = pt(sh[0], sh[1], a[0], B.omero);
      man[k] = pt(gom[k][0], gom[k][1], a[0] + a[1], B.avamb);
      var g = p['gamba' + k];
      gin[k] = pt(hip[0], hip[1], g[0], B.coscia);
      pie[k] = pt(gin[k][0], gin[k][1], g[0] + g[1], B.tibia);
    });
    return { hip: hip, sh: sh, cap: cap, gom: gom, man: man, gin: gin, pie: pie };
  }

  function seg(a, b, w, col) {
    return '<path d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) +
           'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) +
           '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" fill="none"/>';
  }

  /* Corpo e braccia separati: le braccia di chi sorregge vanno disegnate
     sopra a tutto, altrimenti spariscono dietro al corpo sollevato.
     Il verso si legge dai piedi e, per lei, dalla coda di capelli a onda.
     p.piede: rotazione del piede rispetto alla gamba (se assente: -78*verso,
     cioe' appoggiato a terra nel verso dello sguardo). p.codaAng: direzione
     assoluta della coda, interpolata fra le pose. */
  function corpoDi(p, col) {
    var s = scheletro(p), o = [];
    var v = p.verso || 1;
    var pOff = (p.piede != null ? p.piede : -78 * v);
    o.push(seg(s.hip, s.gin.sx, 8.2, col), seg(s.gin.sx, s.pie.sx, 6.8, col));
    o.push(seg(s.pie.sx, pt(s.pie.sx[0], s.pie.sx[1], p.gambasx[0] + p.gambasx[1] + pOff, 4.8), 4.2, col));
    o.push(seg(s.hip, s.gin.dx, 8.2, col), seg(s.gin.dx, s.pie.dx, 6.8, col));
    o.push(seg(s.pie.dx, pt(s.pie.dx[0], s.pie.dx[1], p.gambadx[0] + p.gambadx[1] + pOff, 4.8), 4.2, col));
    o.push(seg(s.hip, s.sh, 11.5, col));
    if (p.coda) {
      var D = (p.codaAng != null ? p.codaAng : 200) * Math.PI / 180;
      var ux = Math.sin(D), uy = -Math.cos(D), px = Math.cos(D), py = Math.sin(D);
      var r0 = B.testa, cx = s.cap[0], cy = s.cap[1];
      o.push('<path d="M' + (cx + ux * r0 * .45).toFixed(1) + ' ' + (cy + uy * r0 * .45).toFixed(1) +
             ' C' + (cx + ux * (r0 + 3.5) + px * 2.6).toFixed(1) + ' ' + (cy + uy * (r0 + 3.5) + py * 2.6).toFixed(1) +
             ' '  + (cx + ux * (r0 + 8) - px * 2.6).toFixed(1)  + ' ' + (cy + uy * (r0 + 8) - py * 2.6).toFixed(1) +
             ' '  + (cx + ux * (r0 + 12)).toFixed(1) + ' ' + (cy + uy * (r0 + 12)).toFixed(1) +
             '" stroke="' + col + '" stroke-width="3.2" stroke-linecap="round" fill="none"/>');
    }
    o.push('<circle cx="' + s.cap[0].toFixed(1) + '" cy="' + s.cap[1].toFixed(1) +
           '" r="' + B.testa + '" fill="' + col + '"/>');
    return o.join('');
  }

  function bracciaDi(p, col) {
    var s = scheletro(p);
    return seg(s.sh, s.gom.sx, 6.8, col) + seg(s.gom.sx, s.man.sx, 5.6, col) +
           seg(s.sh, s.gom.dx, 6.8, col) + seg(s.gom.dx, s.man.dx, 5.6, col);
  }

  /* ---- Pose chiave: da staccati (0) alla presa dell'angelo (1) ---- */
  var POSE = [
    { t: 0.00,
      lui: { hip: [34, 96], busto: 2,  testa: 4,  bracciosx: [196, 14], bracciodx: [166, -16], gambasx: [188, 6], gambadx: [172, -6] },
      lei: { hip: [86, 96], codaAng: -150, piede: -78, busto: -2, testa: -4, bracciosx: [194, 16], bracciodx: [164, -14], gambasx: [188, 6], gambadx: [172, -6] } },

    { t: 0.28,                                   /* si avvicinano e si cercano */
      lui: { hip: [44, 96], busto: 6,  testa: 6,  bracciosx: [128, 6],  bracciodx: [116, 10], gambasx: [196, 12], gambadx: [166, -14] },
      lei: { hip: [78, 96], codaAng: -150, piede: -78, busto: -6, testa: -6, bracciosx: [256, -34], bracciodx: [210, 26], gambasx: [164, -12], gambadx: [194, 14] } },

    { t: 0.55,                                   /* mani unite, lei inizia a salire */
      lui: { hip: [46, 96], busto: 8,  testa: 2,  bracciosx: [110, 4],  bracciodx: [100, 8],  gambasx: [200, 16], gambadx: [160, -18] },
      lei: { hip: [76, 78], codaAng: -138, piede: -40, busto: 10, testa: 6,  bracciosx: [244, -26], bracciodx: [200, 30], gambasx: [214, 30], gambadx: [188, -14] } },

    { t: 0.80,                                   /* stacco: lui alza, lei si distende */
      lui: { hip: [42, 98], busto: 6,  testa: 2,  bracciosx: [52, 6],   bracciodx: [42, 8],   gambasx: [196, 12], gambadx: [166, -14] },
      lei: { hip: [63, 58], codaAng: -20,  piede: 12, busto: -48, testa: 14, bracciosx: [225, 10],  bracciodx: [245, -10], gambasx: [118, -8], gambadx: [140, -16] } },

    { t: 1.00,                                   /* presa dell'angelo: lei orizzontale e inarcata sopra di lui */
      lui: { hip: [40, 98], busto: 8,  testa: 2,  bracciosx: [32, 6],   bracciodx: [24, 8],   gambasx: [196, 10], gambadx: [166, -12] },
      lei: { hip: [59, 50], codaAng: 50,   piede: 14, busto: -98, testa: 30, bracciosx: [215, 15],  bracciodx: [235, -12], gambasx: [108, -20], gambadx: [126, -14] } }
  ];

  function lerp(a, b, k) { return a + (b - a) * k; }
  function lerpPosa(A, Bp, k) {
    var o = { hip: [lerp(A.hip[0], Bp.hip[0], k), lerp(A.hip[1], Bp.hip[1], k)],
              busto: lerp(A.busto, Bp.busto, k), testa: lerp(A.testa, Bp.testa, k) };
    ['bracciosx', 'bracciodx', 'gambasx', 'gambadx'].forEach(function (m) {
      o[m] = [lerp(A[m][0], Bp[m][0], k), lerp(A[m][1], Bp[m][1], k)];
    });
    ['codaAng', 'piede'].forEach(function (m) {
      if (A[m] != null && Bp[m] != null) o[m] = lerp(A[m], Bp[m], k);
    });
    return o;
  }

  function posaA(t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 0; i < POSE.length - 1; i++) {
      if (t <= POSE[i + 1].t) {
        var k = (t - POSE[i].t) / (POSE[i + 1].t - POSE[i].t);
        k = k * k * (3 - 2 * k);                   /* addolcisce gli estremi */
        return { lui: lerpPosa(POSE[i].lui, POSE[i + 1].lui, k),
                 lei: lerpPosa(POSE[i].lei, POSE[i + 1].lei, k) };
      }
    }
    var u = POSE[POSE.length - 1];
    return { lui: u.lui, lei: u.lei };
  }


  var palco = $('#ballerini');
  if (palco && !reduce) {
    var tela = $('svg', palco), ultimo = -1;
    /* Aggiornamento diretto nel gestore dello scorrimento: il browser lo chiama
       gia' a ritmo di fotogramma e il disegno costa pochissimo (18 segmenti).
       Evita di dipendere da requestAnimationFrame, che se non parte lascerebbe
       i ballerini bloccati sulla posa iniziale. */
    var aggiorna = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var t = max > 0 ? window.scrollY / max : 0;
      t = Math.max(0, Math.min(1, t));
      if (Math.abs(t - ultimo) < 0.004) return;
      ultimo = t;
      var p = posaA(t);
      p.lui.verso = 1; p.lei.verso = 1; p.lei.coda = 1;    /* lei di spalle a lui */
      tela.innerHTML = corpoDi(p.lui, VERM) + corpoDi(p.lei, LIME) +
                       bracciaDi(p.lei, LIME) + bracciaDi(p.lui, VERM);
    };
    on(window, 'scroll', aggiorna, { passive: true });
    on(window, 'resize', aggiorna, { passive: true });
    /* a caricamento finito le immagini hanno cambiato l'altezza del documento */
    on(window, 'load', aggiorna);
    aggiorna();
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
