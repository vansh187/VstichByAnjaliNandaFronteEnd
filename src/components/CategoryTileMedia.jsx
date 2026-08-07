import { useEffect, useRef, useState } from "react";
import CategoryVisual from "./CategoryVisual";

// Silent, looping category footage: plays on hover for pointer/mouse
// visitors, and autoplays once scrolled into view on touch devices (which
// report no hover capability) since there's no hover state to trigger it
// there. Falls back to the existing image/gradient CategoryVisual when the
// category has no matching clip or the file fails to load.
export default function CategoryTileMedia({ category, media, containerRef, className = "" }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!media.src || failed) return undefined;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return undefined;

    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    if (hoverCapable) {
      const play = () => video.play().catch(() => {});
      const pause = () => {
        video.pause();
        video.currentTime = 0;
      };
      container.addEventListener("mouseenter", play);
      container.addEventListener("mouseleave", pause);
      return () => {
        container.removeEventListener("mouseenter", play);
        container.removeEventListener("mouseleave", pause);
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(container);
    return () => io.disconnect();
  }, [media.src, failed, containerRef]);

  if (!media.src || failed) {
    return <CategoryVisual category={category} className={className} />;
  }

  return (
    <video
      ref={videoRef}
      className={`object-cover ${className}`}
      poster={media.poster ?? undefined}
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
    >
      {media.mobileSrc && <source src={media.mobileSrc} media="(max-width: 767px)" type="video/mp4" />}
      <source src={media.src} type="video/mp4" />
    </video>
  );
}
