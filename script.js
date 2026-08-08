(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const reducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileNavigation();
    initStickyHeader();
    initScrollProgress();
    initActiveNavigation();
    initSmoothScrolling();
    initCounters();
    initRevealAnimations();
    initYear();
  });

  /* =========================
     THEME
  ========================= */

  function initTheme() {
    const toggle = $("#theme-toggle");
    if (!toggle) return;

    const savedTheme = localStorage.getItem("portfolio-theme");

    const systemTheme =
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";

    function applyTheme(theme) {
      const selected = theme === "light" ? "light" : "dark";

      document.documentElement.dataset.theme = selected;
      localStorage.setItem("portfolio-theme", selected);

      toggle.setAttribute(
        "aria-pressed",
        String(selected === "light")
      );
    }

    applyTheme(savedTheme || systemTheme);

    toggle.addEventListener("click", () => {
      const current =
        document.documentElement.dataset.theme === "light"
          ? "dark"
          : "light";

      applyTheme(current);
    });
  }

  /* =========================
     MOBILE NAVIGATION
  ========================= */

  function initMobileNavigation() {
    const toggle = $("#mobile-menu-toggle");
    const navigation = $("#primary-navigation");

    if (!toggle || !navigation) return;

    function setNavigation(open) {
      toggle.setAttribute("aria-expanded", String(open));

      navigation.classList.toggle("is-open", open);

      navigation.setAttribute(
        "aria-hidden",
        String(!open)
      );

      document.body.classList.toggle("nav-open", open);
    }

    setNavigation(false);

    toggle.addEventListener("click", () => {
      const currentlyOpen =
        toggle.getAttribute("aria-expanded") === "true";

      setNavigation(!currentlyOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setNavigation(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setNavigation(false);
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 900) {
          setNavigation(false);
        }
      },
      { passive: true }
    );
  }

  /* =========================
     STICKY HEADER
  ========================= */

  function initStickyHeader() {
    const header = document.querySelector("header");

    if (!header) return;

    function updateHeader() {
      header.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );
    }

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }

  /* =========================
     SCROLL PROGRESS
  ========================= */

  function initScrollProgress() {
    let progress = $("#scroll-progress");

    if (!progress) {
      progress = document.createElement("div");
      progress.id = "scroll-progress";

      document.body.prepend(progress);
    }

    function updateProgress() {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (documentHeight <= 0) {
        progress.style.width = "0%";
        return;
      }

      const percentage =
        (window.scrollY / documentHeight) * 100;

      progress.style.width =
        `${Math.min(100, Math.max(0, percentage))}%`;
    }

    updateProgress();

    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateProgress,
      { passive: true }
    );
  }

  /* =========================
     ACTIVE NAVIGATION
  ========================= */

  function initActiveNavigation() {
    const links = $$(
      'header a[href^="#"], nav a[href^="#"]'
    );

    const sections = [
      ...new Set(
        links
          .map((link) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return null;

            return document.getElementById(
              href.substring(1)
            );
          })
          .filter(Boolean)
      ),
    ];

    if (
      !sections.length ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const activeId =
              `#${entry.target.id}`;

            links.forEach((link) => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === activeId
              );
            });
          });
        },
        {
          rootMargin: "-25% 0px -60% 0px",
          threshold: 0,
        }
      );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /* =========================
     SMOOTH SCROLLING
  ========================= */

  function initSmoothScrolling() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href =
          link.getAttribute("href");

        if (!href || href === "#") return;

        const target =
          document.getElementById(
            href.substring(1)
          );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: reducedMotion
            ? "auto"
            : "smooth",
          block: "start",
        });

        history.replaceState(
          null,
          "",
          href
        );
      });
    });
  }

  /* =========================
     STATISTICS COUNTERS
  ========================= */

  function initCounters() {
    const counters = $$("[data-target]");

    if (!counters.length) return;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      counters.forEach((counter) => {
        counter.textContent =
          counter.dataset.target +
          (counter.dataset.suffix || "");
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            animateCounter(entry.target);

            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.5,
        }
      );

    counters.forEach((counter) => {
      observer.observe(counter);
    });
  }

  function animateCounter(element) {
    const target =
      Number(element.dataset.target);

    if (!Number.isFinite(target)) return;

    const suffix =
      element.dataset.suffix || "";

    const decimals =
      target % 1 !== 0 ? 1 : 0;

    const duration = 1200;
    const start = performance.now();

    function update(timestamp) {
      const progress = Math.min(
        1,
        (timestamp - start) / duration
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const value =
        target * eased;

      element.textContent =
        value.toFixed(decimals) +
        suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent =
          target.toFixed(decimals) +
          suffix;
      }
    }

    requestAnimationFrame(update);
  }

  /* =========================
     REVEAL ANIMATIONS
  ========================= */

  function initRevealAnimations() {
    const elements = $$(
      "section > .container > *, " +
      "section article, " +
      "section blockquote"
    );

    if (!elements.length) return;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => {
        element.classList.add("visible");
      });

      return;
    }

    elements.forEach((element, index) => {
      element.classList.add("reveal");

      if (index % 4 !== 0) {
        element.classList.add(
          `delay-${index % 4}`
        );
      }
    });

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
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
          rootMargin: "0px 0px -50px 0px",
        }
      );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  /* =========================
     FOOTER YEAR
  ========================= */

  function initYear() {
    const year = $("#year");

    if (year) {
      year.textContent =
        new Date().getFullYear();
    }
  }
})();