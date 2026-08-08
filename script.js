/* =========================================================
   RICARDO TUAZON JR. — PORTFOLIO INTERACTIONS
   Production JavaScript
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     DOM Ready
     --------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initScrollProgress();
    initHeader();
    initNavigation();
    initRevealAnimations();
    initCardGlow();
    initCounters();
    initBackground();
    initFloatingOrbs();
    initScanline();
    initSmoothAnchors();
  });

  /* =========================================================
     THEME
     ========================================================= */

  function initTheme() {
    const toggle =
      $("#theme-toggle") ||
      $('button[aria-label*="theme" i]') ||
      $('button[title*="theme" i]');

    const storedTheme =
      localStorage.getItem("portfolio-theme");

    const preferredTheme =
      storedTheme ||
      (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
      );

    applyTheme(preferredTheme);

    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const current =
        document.documentElement.dataset.theme || "dark";

      applyTheme(current === "dark" ? "light" : "dark");
    });

    function applyTheme(theme) {
      document.documentElement.dataset.theme = theme;

      localStorage.setItem(
        "portfolio-theme",
        theme
      );

      if (toggle) {
        toggle.setAttribute(
          "aria-pressed",
          theme === "light" ? "true" : "false"
        );
      }
    }
  }

  /* =========================================================
     HEADER
     ========================================================= */

  function initHeader() {
    const header = document.querySelector("header");

    if (!header) return;

    const update = () => {
      header.classList.toggle(
        "scrolled",
        window.scrollY > 25
      );
    };

    update();

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );
  }

  /* =========================================================
     SCROLL PROGRESS
     ========================================================= */

  function initScrollProgress() {
    const progress =
      document.createElement("div");

    progress.id = "scroll-progress";

    document.body.appendChild(progress);

    const update = () => {
      const scrollTop = window.scrollY;

      const scrollHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        scrollHeight > 0
          ? (scrollTop / scrollHeight) * 100
          : 0;

      progress.style.width =
        `${Math.min(100, Math.max(0, percentage))}%`;
    };

    update();

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      update,
      { passive: true }
    );
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function initNavigation() {
    const links = $$(
      'header a[href^="#"], nav a[href^="#"]'
    );

    if (!links.length) return;

    const sections = links
      .map(link => {
        const id =
          link.getAttribute("href");

        return id && id !== "#"
          ? document.querySelector(id)
          : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const id =
              `#${entry.target.id}`;

            links.forEach(link => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === id
              );
            });
          });
        },
        {
          rootMargin:
            "-25% 0px -60% 0px",
          threshold: 0
        }
      );

    sections.forEach(section =>
      observer.observe(section)
    );
  }

  /* =========================================================
     SMOOTH ANCHORS
     ========================================================= */

  function initSmoothAnchors() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion
            ? "auto"
            : "smooth",
          block: "start"
        });

        history.replaceState(
          null,
          "",
          targetId
        );
      });
    });
  }

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */

  function initRevealAnimations() {
    const candidates = $$(
      "section > div > *," +
      "section article," +
      "section blockquote," +
      "section h2," +
      "section h3"
    );

    if (!candidates.length) return;

    candidates.forEach((element, index) => {
      if (
        element.classList.contains("reveal")
      ) {
        return;
      }

      element.classList.add("reveal");

      const delay =
        index % 5;

      if (delay > 0) {
        element.classList.add(
          `delay-${delay}`
        );
      }
    });

    if (prefersReducedMotion) {
      candidates.forEach(element =>
        element.classList.add("visible")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.08,
          rootMargin:
            "0px 0px -60px 0px"
        }
      );

    candidates.forEach(element =>
      observer.observe(element)
    );
  }

  /* =========================================================
     CARD MOUSE GLOW
     ========================================================= */

  function initCardGlow() {
    const cards = $$(
      "article," +
      ".card," +
      ".skill-card," +
      ".experience-card," +
      ".lab-card," +
      ".certification-card"
    );

    cards.forEach(card => {
      card.addEventListener(
        "pointermove",
        event => {
          const rect =
            card.getBoundingClientRect();

          const x =
            ((event.clientX - rect.left) /
              rect.width) *
            100;

          const y =
            ((event.clientY - rect.top) /
              rect.height) *
            100;

          card.style.setProperty(
            "--mouse-x",
            `${x}%`
          );

          card.style.setProperty(
            "--mouse-y",
            `${y}%`
          );
        },
        { passive: true }
      );
    });
  }

  /* =========================================================
     ANIMATED COUNTERS
     ========================================================= */

  function initCounters() {
    if (prefersReducedMotion) return;

    const textNodes = [];

    const walker =
      document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

    while (walker.nextNode()) {
      const node =
        walker.currentNode;

      if (!node.nodeValue.trim()) {
        continue;
      }

      const text =
        node.nodeValue.trim();

      if (
        /\d+\+/.test(text) ||
        /\d+%/.test(text) ||
        /\d+\.\d+\/\d+/.test(text)
      ) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const original =
        node.nodeValue;

      const match =
        original.match(
          /^(\D*)(\d+(?:\.\d+)?)(\+|%|\/\d+)?(.*)$/
        );

      if (!match) return;

      const prefix = match[1];
      const value = Number(match[2]);
      const suffix = match[3] || "";
      const trailing = match[4] || "";

      if (
        value <= 0 ||
        value > 1000
      ) {
        return;
      }

      const element =
        document.createElement("span");

      element.dataset.counter =
        String(value);

      element.textContent =
        `${prefix}0${suffix}${trailing}`;

      node.parentNode.replaceChild(
        element,
        node
      );
    });

    const counters =
      $$("[data-counter]");

    if (!counters.length) return;

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) {
              return;
            }

            animateCounter(
              entry.target,
              Number(
                entry.target.dataset.counter
              )
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.6
        }
      );

    counters.forEach(counter =>
      observer.observe(counter)
    );
  }

  function animateCounter(element, target) {
    const duration = 1300;
    const start = performance.now();

    const original =
      element.textContent;

    const prefix =
      original.match(/^\D*/)?.[0] || "";

    const suffix =
      original.match(
        /(\+|%|\/\d+)/
      )?.[0] || "";

    const trailing =
      original.replace(
        prefix,
        ""
      ).replace(
        /^\d+(?:\.\d+)?/,
        ""
      );

    const step = now => {
      const progress =
        Math.min(
          1,
          (now - start) /
          duration
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      const current =
        target * eased;

      let display;

      if (
        target % 1 !== 0
      ) {
        display =
          current.toFixed(1);
      } else {
        display =
          Math.round(current);
      }

      element.textContent =
        `${prefix}${display}${suffix}${trailing}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /* =========================================================
     PARTICLE / NETWORK BACKGROUND
     ========================================================= */

  function initBackground() {
    if (prefersReducedMotion) {
      return;
    }

    const canvas =
      document.createElement("canvas");

    canvas.id =
      "particle-canvas";

    document.body.prepend(canvas);

    const ctx =
      canvas.getContext("2d", {
        alpha: true
      });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    let particles = [];

    const mouse = {
      x: null,
      y: null,
      radius: 150
    };

    const config = {
      density: 0.000055,
      minParticles: 35,
      maxParticles: 95,
      connectionDistance: 145,
      mouseDistance: 190,
      speed: 0.25
    };

    function resize() {
      dpr =
        Math.min(
          window.devicePixelRatio || 1,
          2
        );

      width =
        window.innerWidth;

      height =
        window.innerHeight;

      canvas.width =
        width * dpr;

      canvas.height =
        height * dpr;

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      const calculated =
        Math.floor(
          width *
          height *
          config.density
        );

      const count =
        Math.min(
          config.maxParticles,
          Math.max(
            config.minParticles,
            calculated
          )
        );

      createParticles(count);
    }

    function createParticles(count) {
      particles = [];

      for (let i = 0; i < count; i++) {
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
              : 205
        });
      }
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
          Math.sqrt(
            dx * dx +
            dy * dy
          );

        if (
          distance <
          mouse.radius
        ) {
          const force =
            (mouse.radius -
              distance) /
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
        `hsla(${particle.hue}, 90%, 70%, ${particle.alpha})`;

      ctx.fill();
    }

    function drawConnections() {
      for (
        let i = 0;
        i < particles.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {
          const a =
            particles[i];

          const b =
            particles[j];

          const dx =
            a.x - b.x;

          const dy =
            a.y - b.y;

          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy
            );

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

          ctx.moveTo(
            a.x,
            a.y
          );

          ctx.lineTo(
            b.x,
            b.y
          );

          ctx.strokeStyle =
            `rgba(56, 189, 248, ${alpha})`;

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

      particles.forEach(particle => {
        const dx =
          particle.x -
          mouse.x;

        const dy =
          particle.y -
          mouse.y;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );

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
          `rgba(34, 211, 238, ${alpha})`;

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

      particles.forEach(
        updateParticle
      );

      drawConnections();

      particles.forEach(
        drawParticle
      );

      drawMouseConnections();

      requestAnimationFrame(
        animate
      );
    }

    window.addEventListener(
      "resize",
      resize,
      { passive: true }
    );

    window.addEventListener(
      "pointermove",
      event => {
        mouse.x =
          event.clientX;

        mouse.y =
          event.clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        mouse.x = null;
        mouse.y = null;
      },
      { passive: true }
    );

    resize();
    animate();
  }

  /* =========================================================
     FLOATING ORBS
     ========================================================= */

  function initFloatingOrbs() {
    if (prefersReducedMotion) return;

    const orb1 =
      document.createElement("div");

    orb1.className =
      "glow-orb";

    orb1.style.top = "18%";
    orb1.style.left = "5%";

    document.body.appendChild(orb1);

    const orb2 =
      document.createElement("div");

    orb2.className =
      "glow-orb";

    orb2.style.width = "160px";
    orb2.style.height = "160px";
    orb2.style.right = "8%";
    orb2.style.bottom = "20%";
    orb2.style.animationDelay = "-5s";

    document.body.appendChild(orb2);
  }

  /* =========================================================
     SCANLINE
     ========================================================= */

  function initScanline() {
    if (prefersReducedMotion) {
      return;
    }

    const scanline =
      document.createElement("div");

    scanline.className =
      "scanline";

    document.body.appendChild(
      scanline
    );
  }

  /* =========================================================
     PAGE VISIBILITY
     ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.hidden
      ) {
        document.body.classList.add(
          "page-hidden"
        );
      } else {
        document.body.classList.remove(
          "page-hidden"
        );
      }
    }
  );

})();