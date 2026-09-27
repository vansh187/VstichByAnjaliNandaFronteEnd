import { useEffect, useRef } from "react";

const MARKER = "__vstitchOverlay";

// Makes the phone/browser Back button close a modal instead of leaving the
// page underneath it. While mounted, the modal owns one extra history entry
// at the same URL: Back pops that entry (-> onClose), and closing the modal
// any other way removes the entry again so history isn't left with a
// duplicate. The entry copies React Router's own history.state (idx/key), so
// the router treats popping it as a no-op on the current location.
//
// StrictMode mounts effects twice in development, so the push happens only
// once per component instance and the cleanup's history.back() is deferred
// until it's certain the modal really unmounted rather than remounted.
export function useBackToClose(onClose) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const pushedRef = useRef(false);
  const poppedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    if (!pushedRef.current) {
      window.history.pushState({ ...window.history.state, [MARKER]: true }, "");
      pushedRef.current = true;
    }

    const onPop = () => {
      if (poppedRef.current) return;
      poppedRef.current = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("popstate", onPop);
      setTimeout(() => {
        if (mountedRef.current || poppedRef.current) return;
        // Only undo our own entry - if the user already navigated elsewhere
        // (a link inside the modal, or the tab went to WhatsApp), leave it.
        if (window.history.state?.[MARKER]) window.history.back();
      }, 0);
    };
  }, []);
}
