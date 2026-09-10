/* =============================================
   WATEMURA — App Shell
   Navigation, accordions, shared UI
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initAccordions();
  initScrollNav();
  initNavLogo();
});

/* ─── Scroll-aware nav ─── */
function initScrollNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const isLightPage = nav.classList.contains('nav--light-page');
  const update = () => {
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
      if (!isLightPage) nav.classList.add('nav--light');
    } else {
      nav.classList.remove('nav--scrolled');
      if (!isLightPage) nav.classList.remove('nav--light');
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─── Active nav link ─── */
function initNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
}

/* ─── Mobile menu ─── */
function initMobileMenu() {
  const toggle = document.querySelector('.nav__mobile-toggle');
  const menu = document.querySelector('.mobile-nav');
  const close = document.querySelector('.mobile-nav__close');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeMenu = () => {
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };
  close?.addEventListener('click', closeMenu);
  menu.addEventListener('click', e => { if (e.target === menu) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ─── Accordions ─── */
function initAccordions() {
  document.querySelectorAll('.accordion__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ─── Animate on scroll ─── */
function observeEntries(selector) {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll(selector);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => { el.classList.add('will-animate'); obs.observe(el); });
}

/* CSS for observe animation */
const animStyle = document.createElement('style');
animStyle.textContent = `
  .will-animate { opacity: 0; transform: translateY(24px); transition: opacity 600ms ease, transform 600ms ease; }
  .will-animate.visible { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .will-animate { opacity: 1 !important; transform: none !important; } }
`;
document.head.appendChild(animStyle);

window.WatemuraApp = { observeEntries };

/* ─── Animated vortex logo ─── */
function initNavLogo() {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  document.querySelectorAll('canvas.nav__logo-canvas').forEach(canvas => {
    const S = 44;
    canvas.style.width  = S + 'px';
    canvas.style.height = S + 'px';
    canvas.width  = S * DPR;
    canvas.height = S * DPR;

    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    const cx = S / 2, cy = S / 2, R = S / 2 - 0.5;

    // Seeded pseudo-random for consistent sparkle positions
    let seed = 7919;
    const rnd = () => { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
    const sparks = Array.from({ length: 14 }, () => ({
      t: 0.12 + rnd() * 0.82,
      arm: Math.floor(rnd() * 3),
      phase: rnd() * Math.PI * 2,
      sz: 0.35 + rnd() * 0.85
    }));

    let startT = performance.now();
    let raf;

    function frame(now) {
      const elapsed = (now - startT) * 0.001;
      ctx.clearRect(0, 0, S, S);
      ctx.save();

      // Clip to circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Deep background
      ctx.fillStyle = '#040C14';
      ctx.fillRect(0, 0, S, S);

      // Ambient teal bloom
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      bloom.addColorStop(0,    'rgba(0,80,100,0)');
      bloom.addColorStop(0.65, 'rgba(0,100,140,0.06)');
      bloom.addColorStop(1,    'rgba(0,170,210,0.14)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, S, S);

      const rot = elapsed * 0.28; // ~1 rev per 22 s

      // 3 spiral arms
      for (let arm = 0; arm < 3; arm++) {
        _logoArm(ctx, cx, cy, R, rot + (arm / 3) * Math.PI * 2);
      }

      // Sparkle points along arms
      sparks.forEach(sp => {
        const sweep = Math.PI * 1.75;
        const a = rot + (sp.arm / 3) * Math.PI * 2 + sp.t * sweep;
        const r = R * (0.18 + 0.74 * sp.t * sp.t);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        const pulse = 0.45 + 0.55 * Math.sin(elapsed * 3.4 + sp.phase);
        const alpha = (pulse * (0.2 + 0.7 * sp.t)).toFixed(2);
        ctx.save();
        ctx.shadowBlur = sp.sz * 5;
        ctx.shadowColor = 'rgba(220,248,255,0.9)';
        ctx.beginPath();
        ctx.arc(x, y, sp.sz * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,248,255,${alpha})`;
        ctx.fill();
        ctx.restore();
      });

      // Center void
      const vR = R * 0.27;
      const vGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vR * 2.4);
      vGrad.addColorStop(0,   '#030A12');
      vGrad.addColorStop(0.5, '#040C18');
      vGrad.addColorStop(1,   'rgba(3,10,18,0)');
      ctx.fillStyle = vGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, vR * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, vR, 0, Math.PI * 2);
      ctx.fillStyle = '#020810';
      ctx.fill();

      // Central flame with gentle pulse
      const fh = R * 0.155 * (1 + 0.06 * Math.sin(elapsed * 2.5));
      _logoFlame(ctx, cx, cy, fh);

      ctx.restore();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        if (!es[0].isIntersecting) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(frame);
      }).observe(canvas);
    }
  });
}

function _logoArm(ctx, cx, cy, R, baseAngle) {
  const STEPS = 64;
  const SWEEP = Math.PI * 1.72;
  for (let i = STEPS; i >= 0; i--) {
    const t = i / STEPS;
    const a = baseAngle + t * SWEEP;
    const r = R * (0.18 + 0.74 * t * t);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const w = R * (0.048 + 0.038 * (1 - t));
    const rv = Math.floor(8  + 190 * t);
    const gv = Math.floor(140 + 105 * t);
    const bv = Math.floor(180 + 70  * t);
    const alpha = (0.1 + 0.55 * Math.sin(t * Math.PI)).toFixed(2);
    ctx.save();
    if (t > 0.55) { ctx.shadowBlur = R * 0.18; ctx.shadowColor = 'rgba(80,200,240,0.45)'; }
    ctx.beginPath();
    ctx.arc(x, y, w, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rv},${gv},${bv},${alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

function _logoFlame(ctx, cx, cy, h) {
  const w  = h * 0.44;
  const ty = cy - h * 1.1;
  const by = cy + h * 0.30;
  ctx.save();
  ctx.shadowBlur  = h * 6;
  ctx.shadowColor = 'rgba(140,230,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(cx, ty);
  ctx.bezierCurveTo(cx + w, cy - h * 0.08, cx + w * 0.6, cy + h * 0.45, cx, by);
  ctx.bezierCurveTo(cx - w * 0.6, cy + h * 0.45, cx - w, cy - h * 0.08, cx, ty);
  const g = ctx.createLinearGradient(cx, ty, cx, by);
  g.addColorStop(0,    'rgba(255,255,255,0.98)');
  g.addColorStop(0.25, 'rgba(210,245,255,0.95)');
  g.addColorStop(0.6,  'rgba(100,215,250,0.85)');
  g.addColorStop(1,    'rgba(50,165,220,0.45)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}
