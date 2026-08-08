(() => {
  "use strict";

  const $ = (selector, root = document) => {
    try { return root.querySelector(selector); } catch { return null; }
  };

  const $$ = (selector, root = document) => {
    try { return [...root.querySelectorAll(selector)]; } catch { return []; }
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initTheme() {
    const button = $("#theme-toggle");
    if (!button) return;

    const key = "ricardo-portfolio-theme";
    const saved = localStorage.getItem(key);
    const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    const apply = (theme) => {
      document.documentElement.classList.toggle("light", theme === "light");
      button.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
    };

    const initial = saved || (systemLight ? "light" : "dark");
    apply(initial);

    button.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("light") ? "dark" : "light";
      localStorage.setItem(key, next);
      apply(next);
    });
  }

  function initMobileNav() {
    const button = $("#mobile-menu-toggle");
    const nav = $("#primary-navigation");
    if (!button || !nav) return;

    const close = () => {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation menu");
      nav.classList.remove("is-open");
    };

    const open = () => {
      button.setAttribute("aria-expanded", "true");
      button.setAttribute("aria-label", "Close navigation menu");
      nav.classList.add("is-open");
    };

    button.addEventListener("click", () => {
      button.getAttribute("aria-expanded") === "true" ? close() : open();
    });

    $$(".nav-link", nav).forEach(link => link.addEventListener("click", close));

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        close();
        button.focus();
      }
    });

    document.addEventListener("click", event => {
      if (
        button.getAttribute("aria-expanded") === "true" &&
        !nav.contains(event.target) &&
        !button.contains(event.target)
      ) close();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) close();
    });
  }

  function initStats() {
    const stats = $$(".stat-number");
    if (!stats.length || reducedMotion || !("IntersectionObserver" in window)) return;

    const animate = element => {
      if (element.dataset.animated === "true") return;
      element.dataset.animated = "true";

      const target = Number(element.dataset.target);
      const decimals = Number(element.dataset.decimals || 0);
      const suffix = element.dataset.suffix || "";
      if (!Number.isFinite(target)) return;

      const duration = 1500;
      const start = performance.now();

      const frame = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;

        element.textContent = value.toFixed(decimals) + suffix;

        if (progress < 1) requestAnimationFrame(frame);
        else element.textContent = target.toFixed(decimals) + suffix;
      };

      element.textContent = (0).toFixed(decimals) + suffix;
      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    stats.forEach(stat => observer.observe(stat));
  }

  function initScrollReveal() {
    const sections = $$("main > section");
    if (!sections.length || reducedMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    sections.forEach(section => {
      section.classList.add("reveal-on-scroll");
      observer.observe(section);
    });
  }

  function initHeader() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initYear() {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .catch(error => console.warn("Service Worker registration failed:", error));
    });
  }

  function init() {
    initTheme();
    initMobileNav();
    initStats();
    initScrollReveal();
    initHeader();
    initYear();
    initServiceWorker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
