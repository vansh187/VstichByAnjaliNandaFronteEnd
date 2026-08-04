import { useEffect, useRef, useState } from "react";
import { VolumeOffIcon, VolumeOnIcon } from "./Icons";

// Shared background video + mute toggle for the collections banners, using
// the same sound-on-by-default-with-autoplay-fallback pattern as the home
// page Hero: browsers block autoplay-with-sound until the visitor has
// interacted with the page, so a blocked attempt falls back to muted rather
// than freezing on the first frame, and the very next interaction anywhere
// on the page (except the mute button itself, which manages its own toggle)
// turns sound back on automatically.
const DEFAULT_SRC = "/static/collection/collection-hero.mp4";

export default function CollectionHeroVideo({ src = DEFAULT_SRC, className = "", onError }) {
  const [muted, setMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef(null);
  const muteButtonRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.play().catch(() => {
      if (!video.muted) {
        video.muted = true;
        setMuted(true);
        setAutoplayBlocked(true);
        video.play().catch(() => {});
      }
    });
  }, [muted]);

  useEffect(() => {
    if (!autoplayBlocked) return undefined;

    function unmuteOnFirstInteraction(event) {
      if (muteButtonRef.current?.contains(event.target)) return;
      setMuted(false);
      setAutoplayBlocked(false);
    }

    document.addEventListener("pointerdown", unmuteOnFirstInteraction, { once: true });
    document.addEventListener("keydown", unmuteOnFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unmuteOnFirstInteraction);
      document.removeEventListener("keydown", unmuteOnFirstInteraction);
    };
  }, [autoplayBlocked]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted={muted}
        playsInline
        onError={onError}
        className={className}
      />
      <button
        ref={muteButtonRef}
        type="button"
        aria-label={muted ? "Unmute video" : "Mute video"}
        onClick={() => {
          setAutoplayBlocked(false);
          setMuted((m) => !m);
        }}
        className="absolute right-5 top-6 z-10 text-cream/70 transition-colors hover:text-cream sm:right-8"
      >
        {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
      </button>
    </>
  );
}
