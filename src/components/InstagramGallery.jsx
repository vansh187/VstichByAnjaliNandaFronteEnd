import { useRef, useState } from "react";
import { instagramTiles } from "../data/marketing";
import Swatch from "./Swatch";
import { InstagramIcon } from "./Icons";
import { INSTAGRAM_URL } from "../utils/contact";

// Tiles play silently, no exceptions - per client request, there is no
// unmute control here even for a future musicSrc track.
function InstagramVideoTile({ tile, index }) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const play = () => {
    videoRef.current?.play().catch(() => {});
  };

  const stop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div
      data-reveal
      className="reveal group relative aspect-square overflow-hidden"
      style={{ transitionDelay: `${index * 60}ms` }}
      onMouseEnter={play}
      onMouseLeave={stop}
      onTouchStart={play}
      onTouchEnd={stop}
    >
      {/* Instant-paint placeholder - visible until the video's first frame
          has actually loaded, and stays underneath as a fallback if the
          clip fails to load at all. */}
      <Swatch
        tone={tile.tone}
        monogram="VN"
        className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-110"
      />

      {/* preload="auto" + showing this at all times (not just on hover) is
          what makes it read as a paused video by default, per client
          feedback - it should look like a video waiting to play, not a
          plain color tile until the user happens to hover it. */}
      <video
        ref={videoRef}
        src={tile.video}
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View on Instagram"
        className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink/40 text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <InstagramIcon width="16" height="16" />
      </a>
    </div>
  );
}

export default function InstagramGallery() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div data-reveal className="reveal mb-10 flex flex-col items-center gap-3 text-center">
        <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Follow the Journey
        </span>
        <h2 className="font-display text-4xl text-ink sm:text-5xl">@vstitchbyanjalinanda</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {instagramTiles.map((tile, i) => (
          <InstagramVideoTile key={tile.id} tile={tile} index={i} />
        ))}
      </div>
    </section>
  );
}
