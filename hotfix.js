/* Portfolio v2 hotfix: mobile navigation + current data-target counters. */
(() => {
  'use strict';
  const init = () => {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('#mobile-menu-toggle');
    const nav = document.querySelector('#primary-navigation');
    if (header && toggle && nav) {
      const close = () => { header.classList.remove('nav-open'); toggle.setAttribute('aria-expanded','false'); };
      toggle.addEventListener('click', () => {
        const open = !header.classList.contains('nav-open');
        header.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', close));
      document.addEventListener('click', e => { if (!header.contains(e.target)) close(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); }, {passive:true});
    }

    const counters = [...document.querySelectorAll('.stat-number[data-target]')];
    if (!counters.length || !('IntersectionObserver' in window)) return;
    const animate = (el) => {
      if (el.dataset.hotfixAnimated === '1') return;
      el.dataset.hotfixAnimated = '1';
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      if (!Number.isFinite(target)) return;
      const decimal = target % 1 !== 0;
      const start = performance.now();
      const step = now => {
        const p = Math.min(1, (now-start)/1200);
        const eased = 1-Math.pow(1-p,3);
        const value = target*eased;
        el.textContent = (decimal ? value.toFixed(1) : Math.round(value)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){animate(e.target);observer.unobserve(e.target);}}), {threshold:.5});
    counters.forEach(c => observer.observe(c));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
