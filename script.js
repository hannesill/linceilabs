(() => {
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
    return;
  }

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
})();
