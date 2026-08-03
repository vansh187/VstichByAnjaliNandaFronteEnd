import { useEffect, useRef } from "react";

// Shared Escape-to-close + body-scroll-lock behavior for drawers/modals.
// onClose is read through a ref rather than being a dependency of the main
// effect, so passing a new closure every render (as most callers do, e.g.
// an inline () => setOpen(false) or a handler that reads other state) never
// tears down and re-adds the document listener / re-toggles body scroll —
// that only happens when isOpen itself actually changes.
export function useOverlay(isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}
