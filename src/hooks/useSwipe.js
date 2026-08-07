import { useRef } from "react";

const SWIPE_THRESHOLD_PX = 40;

// Detects a horizontal touch swipe and fires onSwipeLeft/onSwipeRight -
// shared between the product image gallery and its lightbox so both get
// the same "swipe to next/previous image" behavior from one place.
export function useSwipe(onSwipeLeft, onSwipeRight) {
  const startX = useRef(null);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    // A real swipe shouldn't also trigger the tap/click the browser
    // synthesizes right after touchend - without this, swiping to change
    // the image on the gallery button also "clicks" it open into the
    // lightbox, and swiping inside the lightbox immediately closes it.
    e.preventDefault();
    if (deltaX < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  };

  return { onTouchStart, onTouchEnd };
}
