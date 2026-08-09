/* Visual restoration layer: profile photo + resilient premium motion. */
(() => {
  'use strict';

  const PHOTO = 'https://raw.githubusercontent.com/rictuazon17/ric-portfolio-site/main/123.jpg';

  const install = () => {
    // Restore Ricardo's actual profile photo without changing the separate reference site.
    const avatar = document.querySelector('.hero-avatar');
    if (avatar && !avatar.querySelector('img')) {
      avatar.innerHTML = `
        <img class="hero-profile-photo" src="${PHOTO}" alt="Ricardo Tuazon Jr. — Senior IT Support Engineer" loading="eager" decoding="async">
        <span class="hero-profile-initials" aria-hidden="true">RT</span>
        <small aria-hidden="true">IT</small>
      `;
    }

    // Guarantee the pointer layer is visible on desktop even if another script initializes late.
    if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const cursor = document.querySelector('#cursor');
      const dot = document.querySelector('#cursor-dot');
      if (cursor && dot && !window.__ricardoCursorFix) {
        window.__ricardoCursorFix = true;
        let x = innerWidth / 2, y = innerHeight / 2;
        let tx = x, ty = y;
        addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; dot.style.left = `${tx}px`; dot.style.top = `${ty}px`; }, {passive:true});
        const frame = () => {
          x += (tx - x) * .16;
          y += (ty - y) * .16;
          cursor.style.left = `${x}px`;
          cursor.style.top = `${y}px`;
          requestAnimationFrame(frame);
        };
        frame();
        document.querySelectorAll('a,button,.glass-card,.skill-category,.cert-card,.timeline-card').forEach(el => {
          el.addEventListener('pointerenter', () => cursor.classList.add('hover'));
          el.addEventListener('pointerleave', () => cursor.classList.remove('hover'));
        });
      }
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .hero-avatar { overflow: hidden; position: relative; }
    .hero-profile-photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:50%; z-index:1; display:block; filter:saturate(1.04) contrast(1.02); }
    .hero-avatar::after { z-index:2; }
    .hero-profile-initials { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:0; }
    .hero-avatar small { z-index:3; }
    @media (prefers-reduced-motion: reduce) { .hero-profile-photo { transition:none!important; } }
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
