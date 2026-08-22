import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useAnyOverlayOpen } from "../hooks/useOverlay";
import { ChevronLeftIcon } from "./Icons";

// Rendered once at the app root (not per-page) so it shows up on every
// route without having to touch each page component individually.
export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const overlayOpen = useAnyOverlayOpen();

  // Tracks in-app navigation depth ourselves via the public useNavigationType
  // API instead of reading window.history.state.idx, which is an undocumented
  // internal field of react-router's history implementation and not a stable
  // contract to depend on. PUSH deepens the stack, POP (back/forward) backs
  // out of it, REPLACE (e.g. redirects) leaves depth unchanged; it never goes
  // below 0, which is also true on the very first page load.
  const depthRef = useRef(0);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (navigationType === "PUSH") {
      depthRef.current += 1;
    } else if (navigationType === "POP" && depthRef.current > 0) {
      depthRef.current -= 1;
    }
    setCanGoBack(depthRef.current > 0);
  }, [location, navigationType]);

  if (!canGoBack || overlayOpen) return null;

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => navigate(-1)}
      className="fixed bottom-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-sand-dark/70 bg-cream text-ink shadow-lg transition-colors hover:bg-sand/60 hover:text-gold"
    >
      <ChevronLeftIcon />
    </button>
  );
}
