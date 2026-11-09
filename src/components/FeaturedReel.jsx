import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { featuredReel as reel } from "../data/marketing";
import { InstagramIcon, VolumeOffIcon, VolumeOnIcon } from "./Icons";

// Home-page spotlight for an influencer collab reel. Content lives in
// data/marketing.js (featuredReel) so the next launch is a data change only.
function ReelMedia() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  // Self-hosted copy: autoplays muted (browsers only allow muted autoplay),
  // with a button to turn the sound on.
  if (reel.video) {
    const toggleSound = () => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setMuted(video.muted);
      if (!video.muted) video.play().catch(() => {});
    };

    return (
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-ink shadow-2xl">
        <video
          ref={videoRef}
          src={reel.video}
          poster={reel.poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-ink/60 text-cream backdrop-blur-sm transition-colors hover:bg-ink/80"
        >
          {muted ? <VolumeOffIcon width="18" height="18" /> : <VolumeOnIcon width="18" height="18" />}
        </button>
        <a
          href={reel.reelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium text-cream backdrop-blur-sm"
        >
          <InstagramIcon width="14" height="14" />@{reel.creatorHandle}
        </a>
      </div>
    );
  }

  // Official Instagram embed: plays the real reel inline (tap to play) and
  // credits the creator. Lazy so it doesn't slow down the first paint.
  return (
    <div className="w-full overflow-hidden rounded-[1.75rem] border border-sand-dark bg-white shadow-2xl">
      <iframe
        src={reel.embedUrl}
        title={`Instagram reel by @${reel.creatorHandle}`}
        loading="lazy"
        scrolling="no"
        allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
        allowFullScreen
        className="block h-[620px] w-full sm:h-[640px]"
      />
    </div>
  );
}

export default function FeaturedReel() {
  if (!reel?.enabled) return null;

  return (
    <section className="bg-sand/40">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1fr_340px] md:gap-16 lg:py-24">
        <div data-reveal className="reveal order-2 text-center md:order-1 md:text-left">
          <span className="inline-flex items-center gap-2 font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden="true" />
            {reel.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">{reel.title}</h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-charcoal/75 md:mx-0">{reel.copy}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to={reel.shopHref}
              className="bg-ink px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
            >
              {reel.shopLabel}
            </Link>
            <a
              href={reel.reelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-ink px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              <InstagramIcon width="16" height="16" />
              Watch on Instagram
            </a>
          </div>
        </div>

        <div data-reveal className="reveal order-1 mx-auto w-full max-w-[340px] md:order-2">
          <ReelMedia />
        </div>
      </div>
    </section>
  );
}
