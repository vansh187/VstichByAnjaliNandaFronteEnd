import { useEffect, useRef, useSyncExternalStore } from "react";

// Module-level count of currently-open overlays (drawers/modals), shared
// across every useOverlay() caller regardless of which component tree
// they live in - lets unrelated UI (e.g. BackButton) know an overlay is
// up top without each overlay having to be threaded through props/context.
let openOverlayCount = 0;
const overlayListeners = new Set();
const notifyOverlayListeners = () => overlayListeners.forEach((listener) => listener());

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
    openOverlayCount += 1;
    notifyOverlayListeners();
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      openOverlayCount -= 1;
      notifyOverlayListeners();
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}

// True while any drawer/modal using useOverlay() is open - lets fixed,
// page-level UI (e.g. BackButton) unmount itself rather than sit beneath
// a modal backdrop while remaining reachable by keyboard tab order.
export function useAnyOverlayOpen() {
  return useSyncExternalStore(
    (listener) => {
      overlayListeners.add(listener);
      return () => overlayListeners.delete(listener);
    },
    () => openOverlayCount > 0,
  );
}
