(() => {
  document.documentElement.classList.add("js");

  // Download buttons follow the visitor's OS. Without a match (no script, a phone, anything
  // else) they link to the releases page. Browsers cannot tell Apple Silicon from Intel, or an
  // ARM PC from an x64 one, so Macs get the Apple Silicon build and PCs the x64 one, and the line
  // under the hero buttons offers the other.
  // The direct links need a published release: GitHub's "latest" skips drafts and pre-releases.
  const releases = "https://github.com/hannesill/lincei/releases";
  const downloads = {
    mac: { label: "Download for macOS", href: `${releases}/latest/download/Lincei-mac-arm64.dmg` },
    linux: { label: "Download for Linux", href: `${releases}/latest/download/Lincei-linux-x64.AppImage` },
    windows: { label: "Download for Windows", href: `${releases}/latest/download/Lincei-win-x64.exe` },
  };
  const detectPlatform = () => {
    const agent = navigator.userAgent;
    if (/iPhone|iPad|iPod|Android|CrOS/i.test(agent)) return null;
    if (/Windows/i.test(agent)) return "windows";
    // iPadOS reports itself as a Mac; no Mac has a touch screen.
    if (/Macintosh/i.test(agent)) return navigator.maxTouchPoints > 1 ? null : "mac";
    if (/Linux/i.test(agent)) return "linux";
    return null;
  };
  const platform = detectPlatform();
  if (platform) {
    document.documentElement.dataset.platform = platform;
    const { label, href } = downloads[platform];
    document.querySelectorAll("[data-download]").forEach((link) => {
      link.querySelector("[data-download-label]").textContent = label;
      link.href = href;
      link.removeAttribute("target");
      link.removeAttribute("rel");
    });
  }

  const header = document.querySelector("[data-header]");
  const hero = document.querySelector("[data-hero]");
  const field = document.querySelector("[data-float]");
  const tilted = document.querySelector("[data-tilt]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // The header gets its rule once the page scrolls; the hero screenshot flattens over the first 420px.
  let scrollFrame = 0;
  const onScroll = () => {
    scrollFrame = 0;
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
    if (tilted && !reducedMotion.matches) {
      const progress = Math.min(window.scrollY / 420, 1);
      tilted.style.setProperty("--tilt", `${(3 * (1 - progress)).toFixed(2)}deg`);
    }
  };
  window.addEventListener(
    "scroll",
    () => {
      scrollFrame ||= requestAnimationFrame(onScroll);
    },
    { passive: true },
  );
  onScroll();

  // Agent marks drift a little toward the pointer, only while it moves over the hero.
  if (hero && field) {
    let pointerFrame = 0;
    let pointer = null;
    hero.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      pointerFrame ||= requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!pointer) return;
        const bounds = hero.getBoundingClientRect();
        field.style.setProperty("--px", `${(((pointer.x - bounds.left) / bounds.width - 0.5) * 36).toFixed(1)}px`);
        field.style.setProperty("--py", `${(((pointer.y - bounds.top) / bounds.height - 0.5) * 28).toFixed(1)}px`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      pointer = null;
      field.style.setProperty("--px", "0px");
      field.style.setProperty("--py", "0px");
    });
  }

  const revealElements = document.querySelectorAll("[data-reveal]");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8%", threshold: 0.1 },
  );
  revealElements.forEach((element) => observer.observe(element));
})();
