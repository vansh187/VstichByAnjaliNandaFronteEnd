import { useEffect } from "react";

// Browsers restore scroll position on back/forward but not on normal
// client-side navigation, so without this a page can mount already
// scrolled down (inherited from wherever the previous page was scrolled to).
function ScrollToTop({ pathname }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
