import { useEffect, useRef } from "react";

// Toggles `.is-visible` on every [data-reveal] descendant of the returned
// ref once it scrolls into view. A MutationObserver keeps watching after the
// initial scan since catalog sections render their [data-reveal] cards
// asynchronously, once their data finishes loading.
//
// [data-reveal] elements start at opacity:0 (see .reveal in index.css), so
// this hook MUST fail open. In-app browsers (Instagram, Facebook, …)
// routinely never deliver IntersectionObserver callbacks on scroll, which
// would leave whole pages permanently blank. Safety nets:
//   1. No IntersectionObserver at all -> reveal everything immediately.
//   2. A passive scroll/resize listener reveals anything that has come near
//      the viewport, independent of the observer. This is what rescues the
//      in-app browsers; it self-removes once nothing is left hidden.
export function useReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const hidden = () => root.querySelectorAll("[data-reveal]:not(.is-visible)");
    const revealAll = () => {
      if (root.matches?.("[data-reveal]")) root.classList.add("is-visible");
      hidden().forEach((el) => el.classList.add("is-visible"));
    };

    if (typeof IntersectionObserver === "undefined") {
      revealAll();
      return undefined;
    }

    // threshold:0 (not 0.15) so a section taller than the viewport — a full
    // category grid on a phone — still triggers instead of never reaching
    // the visibility ratio.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );

    const observe = (el) => io.observe(el);
    const collect = (node) => {
      if (node.hasAttribute?.("data-reveal")) observe(node);
      node.querySelectorAll?.("[data-reveal]").forEach(observe);
    };

    // Scroll fallback: reveal anything whose top edge is within ~110% of the
    // viewport height. rAF-throttled; detaches once nothing is left hidden.
    let ticking = false;
    let fallbackActive = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    };

    const teardownFallback = () => {
      if (!fallbackActive) return;
      fallbackActive = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const setupFallback = () => {
      if (fallbackActive) return;
      fallbackActive = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    };

    function sweep() {
      ticking = false;
      const limit = window.innerHeight * 1.1;
      let remaining = 0;
      hidden().forEach((el) => {
        if (el.getBoundingClientRect().top <= limit) el.classList.add("is-visible");
        else remaining += 1;
      });
      if (remaining === 0) teardownFallback();
    }

    collect(root);
    setupFallback();
    // First sweep after paint so above-the-fold content is never stuck
    // hidden even if the observer is silent from the start.
    requestAnimationFrame(sweep);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) collect(node);
        });
      });
      setupFallback();
      onScroll();
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      teardownFallback();
    };
  }, []);

  return containerRef;
}
