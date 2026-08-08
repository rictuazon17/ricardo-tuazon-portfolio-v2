/* =========================================================
   RICARDO TUAZON JR. — PORTFOLIO INTERACTIONS
   Production JavaScript
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initHeader();
    initScrollProgress();
    initNavigation();
    initSmoothAnchors();
    initRevealAnimations();
    initCardGlow();
    initCounters();
    initBackground();
    initFloatingOrbs();
    initScanline();
  });

  function initTheme() {
    const toggle =
      $("#theme-toggle") ||
      $('button[aria-label*="theme" i]') ||
      $('button[title*="theme" i]');

    const saved = localStorage.getItem("portfolio-theme");
    const systemLight =
      window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;

    const applyTheme = (theme) => {
      const safeTheme = theme === "light" ? "light" : "dark";

      document.documentElement.dataset.theme = safeTheme;
      localStorage.setItem("portfolio-theme", safeTheme);

      if (toggle) {
        toggle.setAttribute(
          "aria-pressed",
          safeTheme === "light" ? "true" : "false"
        );
      }
    };

    applyTheme(saved || (systemLight ? "light" : "dark"));

    if (toggle) {
      toggle.addEventListener("click", () => {
        const current =
          document.documentElement.dataset.theme === "light"
            ? "light"
            : "dark";

        applyTheme(current === "dark" ? "light" : "dark");
      });
    }
  }

  function initHeader() {
    const header = $("header");
    if (!header) return;

    const update = () => {
      header.classList.toggle("scrolled", window.scrollY > 25);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initScrollProgress() {
    let progress = $("#scroll-progress");

    if (!progress) {
      progress = document.createElement("div");
      progress.id = "scroll-progress";
      document.body.appendChild(progress);
    }

    const update = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage =
        maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

      progress.style.width =
        Math.min(100, Math.max(0, percentage)) + "%";
    };

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }

  function initNavigation() {
    const links = $$('header a[href^="#"], nav a[href^="#"]');

    if (!links.length || !("IntersectionObserver" in window)) return;

    const sections = [
      ...new Set(
        links
          .map((link) => {
            const id = link.getAttribute("href");

            if (!id || id === "#") return null;

            try {
              return document.querySelector(id);
            } catch {
              return null;
            }
          })
          .filter(Boolean)
      ),
    ];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = "#" + entry.target.id;

          links.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === id
            );
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initSmoothAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");

        if (!id || id === "#") return;

        let target;

        try {
          target = document.querySelector(id);
        } catch {
          return;
        }

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        history.replaceState(null, "", id);
      });
    });
  }

  function initRevealAnimations() {
    const elements = $$(
      "section > div > *, section article, section blockquote, section h2, section h3"
    );

    if (!elements.length) return;

    elements.forEach((element, index) => {
      element.classList.add("reveal");

      const delay = index % 5;

      if (delay > 0) {
        element.classList.add("delay-" + delay);
      }

      if (prefersReducedMotion) {
        element.classList.add("visible");
      }
    });

    if (
      prefersReducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function initCardGlow() {
    const cards = $$(
      "article, .card, .skill-card, .experience-card, .lab-card, .certification-card, .recommendation-card"
    );

    cards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();

          if (!rect.width || !rect.height) return;

          const x =
            ((event.clientX - rect.left) / rect.width) * 100;

          const y =
            ((event.clientY - rect.top) / rect.height) * 100;

          card.style.setProperty("--mouse-x", x + "%");
          card.style.setProperty("--mouse-y", y + "%");
        },
        { passive: true }
      );
    });
  }

  function initCounters() {
    if (
      prefersReducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const counters = $$("[data-count]");

    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const target = Number(element.dataset.count);

          if (!Number.isFinite(target)) {
            observer.unobserve(element);
            return;
          }

          animateCounter(element, target);
          observer.unobserve(element);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function animateCounter(element, target) {
    const duration = 1400;
    const start = performance.now();

    const suffix = element.dataset.suffix || "";

    const decimals = Math.max(
      0,
      Number(element.dataset.decimals || 0)
    );

    const step = (now) => {
      const progress = Math.min(
        1,
        (now - start) / duration
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const value = target * eased;

      element.textContent =
        value.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent =
          target.toFixed(decimals) + suffix;
      }
    };

    requestAnimationFrame(step);
  }

  function initBackground() {
    if (prefersReducedMotion) return;

    let canvas = $("#particle-canvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "particle-canvas";
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext("2d", {
      alpha: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];

    const mouse = {
      x: null,
      y: null,
      radius: 150,
    };

    const config = {
      density: 0.000055,
      minParticles: 35,
      maxParticles: 95,
      connectionDistance: 145,
      mouseDistance: 190,
      speed: 0.25,
    };

    function createParticles(count) {
      particles = [];

      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,

          vx:
            (Math.random() - 0.5) *
            config.speed,

          vy:
            (Math.random() - 0.5) *
            config.speed,

          size:
            Math.random() * 1.7 +
            0.45,

          alpha:
            Math.random() * 0.45 +
            0.18,

          hue:
            Math.random() > 0.75
              ? 190
              : 205,
        });
      }
    }

    function resize() {
      dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      const calculated = Math.floor(
        width *
        height *
        config.density
      );

      const count = Math.min(
        config.maxParticles,
        Math.max(
          config.minParticles,
          calculated
        )
      );

      createParticles(count);
    }

    function updateParticle(particle) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) {
        particle.x = width + 20;
      }

      if (particle.x > width + 20) {
        particle.x = -20;
      }

      if (particle.y < -20) {
        particle.y = height + 20;
      }

      if (particle.y > height + 20) {
        particle.y = -20;
      }

      if (
        mouse.x !== null &&
        mouse.y !== null
      ) {
        const dx =
          particle.x - mouse.x;

        const dy =
          particle.y - mouse.y;

        const distance =
          Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force =
            (mouse.radius - distance) /
            mouse.radius;

          particle.x +=
            (dx / (distance || 1)) *
            force *
            0.7;

          particle.y +=
            (dy / (distance || 1)) *
            force *
            0.7;
        }
      }
    }

    function drawParticle(particle) {
      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "hsla(" +
        particle.hue +
        ", 90%, 70%, " +
        particle.alpha +
        ")";

      ctx.fill();
    }

    function drawConnections() {
      for (
        let i = 0;
        i < particles.length;
        i += 1
      ) {
        for (
          let j = i + 1;
          j < particles.length;
          j += 1
        ) {
          const a = particles[i];
          const b = particles[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;

          const distance =
            Math.hypot(dx, dy);

          if (
            distance >
            config.connectionDistance
          ) {
            continue;
          }

          const alpha =
            (1 -
              distance /
                config.connectionDistance) *
            0.13;

          ctx.beginPath();

          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);

          ctx.strokeStyle =
            "rgba(56, 189, 248, " +
            alpha +
            ")";

          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    }

    function drawMouseConnections() {
      if (
        mouse.x === null ||
        mouse.y === null
      ) {
        return;
      }

      particles.forEach((particle) => {
        const dx =
          particle.x - mouse.x;

        const dy =
          particle.y - mouse.y;

        const distance =
          Math.hypot(dx, dy);

        if (
          distance >
          config.mouseDistance
        ) {
          return;
        }

        const alpha =
          (1 -
            distance /
              config.mouseDistance) *
          0.26;

        ctx.beginPath();

        ctx.moveTo(
          particle.x,
          particle.y
        );

        ctx.lineTo(
          mouse.x,
          mouse.y
        );

        ctx.strokeStyle =
          "rgba(34, 211, 238, " +
          alpha +
          ")";

        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    }

    function animate() {
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      particles.forEach(updateParticle);
      drawConnections();
      particles.forEach(drawParticle);
      drawMouseConnections();

      requestAnimationFrame(animate);
    }

    window.addEventListener(
      "resize",
      resize,
      { passive: true }
    );

    window.addEventListener(
      "pointermove",
      (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "blur",
      () => {
        mouse.x = null;
        mouse.y = null;
      },
      { passive: true }
    );

    resize();
    animate();
  }

  function initFloatingOrbs() {
    if (
      prefersReducedMotion ||
      $(".glow-orb")
    ) {
      return;
    }

    const orb1 =
      document.createElement("div");

    orb1.className = "glow-orb";
    orb1.style.top = "18%";
    orb1.style.left = "5%";

    document.body.appendChild(orb1);

    const orb2 =
      document.createElement("div");

    orb2.className = "glow-orb";
    orb2.style.width = "160px";
    orb2.style.height = "160px";
    orb2.style.right = "8%";
    orb2.style.bottom = "20%";
    orb2.style.animationDelay = "-5s";

    document.body.appendChild(orb2);
  }

  function initScanline() {
    if (
      prefersReducedMotion ||
      $(".scanline")
    ) {
      return;
    }

    const scanline =
      document.createElement("div");

    scanline.className = "scanline";

    document.body.appendChild(scanline);
  }

  document.addEventListener(
    "visibilitychange",
    () => {
      document.body.classList.toggle(
        "page-hidden",
        document.hidden
      );
    }
  );
})();