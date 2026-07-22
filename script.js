(() => {
  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const closeNavigation = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") ?? false;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNavigation();
  });
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const revealElements = document.querySelectorAll("[data-reveal]");
  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  const tiltPanel = document.querySelector("[data-tilt-panel]");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let tiltFrame = 0;

  const resetTilt = () => {
    if (!tiltPanel) return;
    window.cancelAnimationFrame(tiltFrame);
    tiltPanel.classList.remove("is-tilting");
    tiltPanel.style.setProperty("--tilt-x", "0deg");
    tiltPanel.style.setProperty("--tilt-y", "0deg");
    tiltPanel.style.setProperty("--pointer-x", "50%");
    tiltPanel.style.setProperty("--pointer-y", "50%");
  };

  if (tiltPanel && precisePointer.matches && !motionQuery.matches) {
    tiltPanel.addEventListener("pointermove", (event) => {
      const bounds = tiltPanel.getBoundingClientRect();
      const pointerX = (event.clientX - bounds.left) / bounds.width;
      const pointerY = (event.clientY - bounds.top) / bounds.height;
      const rotateX = (0.5 - pointerY) * 7;
      const rotateY = (pointerX - 0.5) * 8;

      window.cancelAnimationFrame(tiltFrame);
      tiltFrame = window.requestAnimationFrame(() => {
        tiltPanel.classList.add("is-tilting");
        tiltPanel.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        tiltPanel.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
        tiltPanel.style.setProperty("--pointer-x", `${(pointerX * 100).toFixed(1)}%`);
        tiltPanel.style.setProperty("--pointer-y", `${(pointerY * 100).toFixed(1)}%`);
      });
    });

    tiltPanel.addEventListener("pointerleave", resetTilt);
    tiltPanel.addEventListener("pointercancel", resetTilt);
    window.addEventListener("blur", resetTilt);
  }
})();
