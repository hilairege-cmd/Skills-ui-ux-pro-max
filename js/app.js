/* =============================================
   WATEMURA — App Shell
   Navigation, accordions, shared UI
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initAccordions();
  initScrollNav();
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
