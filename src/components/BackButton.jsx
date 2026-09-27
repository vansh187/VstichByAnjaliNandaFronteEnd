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

  // Tracks in-app history ourselves via the public useNavigationType API and
  // location.key instead of reading window.history.state.idx, which is an
  // undocumented internal field of react-router's history implementation and
  // not a stable contract to depend on. Keeps the list of entry keys seen and
  // where we are in it: PUSH drops any forward entries and appends, REPLACE
  // swaps the current key, and POP looks the key up - so Back *and* Forward
  // both land on the right index (a plain depth counter can't tell them
  // apart). An unknown key on POP (first load, or history from before a
  // reload) restarts the list there, so the button never offers a Back
  // that would leave the app.
  const historyRef = useRef({ keys: [], index: -1 });
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const h = historyRef.current;
    if (navigationType === "PUSH") {
      h.keys = [...h.keys.slice(0, h.index + 1), location.key];
      h.index = h.keys.length - 1;
    } else if (navigationType === "REPLACE" && h.index >= 0) {
      h.keys[h.index] = location.key;
    } else {
      const i = h.keys.indexOf(location.key);
      if (i >= 0) {
        h.index = i;
      } else {
        h.keys = [location.key];
        h.index = 0;
      }
    }
    setCanGoBack(h.index > 0);
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
