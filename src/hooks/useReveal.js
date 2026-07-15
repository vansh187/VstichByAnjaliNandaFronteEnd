import { useEffect, useRef } from "react";

// Adds the `reveal` class's `is-visible` toggle to every [data-reveal]
// descendant of the returned ref once it scrolls into view.
export function useReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const targets = root.hasAttribute("data-reveal")
      ? [root]
      : Array.from(root.querySelectorAll("[data-reveal]"));

    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}
