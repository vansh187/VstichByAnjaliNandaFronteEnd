import { useEffect, useRef } from "react";

// Adds the `reveal` class's `is-visible` toggle to every [data-reveal]
// descendant of the returned ref once it scrolls into view. A MutationObserver
// keeps watching after the initial scan since catalog sections render their
// [data-reveal] cards asynchronously, once their data finishes loading.
export function useReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    const observe = (el) => io.observe(el);
    const collect = (node) => {
      if (node.hasAttribute?.("data-reveal")) observe(node);
      node.querySelectorAll?.("[data-reveal]").forEach(observe);
    };

    collect(root);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) collect(node);
        });
      });
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return containerRef;
}
