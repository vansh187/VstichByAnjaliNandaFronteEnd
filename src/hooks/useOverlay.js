import { useEffect } from "react";

// Shared Escape-to-close + body-scroll-lock behavior for drawers/modals.
export function useOverlay(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);
}
