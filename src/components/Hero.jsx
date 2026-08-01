import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from "./Icons";
import Swatch from "./Swatch";
import { useCategories } from "../hooks/useCategories";
import { useBestSellers } from "../hooks/useBestSellers";
import { QUALIFYING_THRESHOLD } from "./Bestsellers";
import { getCategoryTone, getCategoryQuote } from "../utils/categoryTheme";

// Hero background videos, one per live category — served from /public/static
// so the build copies them to the deployed site's root untouched (same
// relative URL in dev and every deployment, no bundler asset-hashing to
// keep in sync). Matched against the category's real name, never a
// hardcoded category id, so this keeps working if categories are
// renamed/reordered on the backend. A category with no matching video below
// falls back to a themed gradient instead of breaking.
const CATEGORY_VIDEOS = [
  { keywords: ["cord set", "co-ord", "coord"], src: "/static/cord-set/cord-set-hero.mp4" },
  { keywords: ["shirt"], src: "/static/shirts/shirts-hero.mp4" },
];

function resolveVideoForCategory(categoryName) {
  const name = categoryName.toLowerCase();
  return CATEGORY_VIDEOS.find((entry) => entry.keywords.some((keyword) => name.includes(keyword)))
    ?.src ?? null;
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Defaults to sound on. Browsers block autoplay-with-sound until the
  // visitor has interacted with the page or the site, so this can silently
  // fail on a first visit - the play effect below detects that and falls
  // back to muted (so the hero still animates instead of freezing) rather
  // than erroring. Once the visitor interacts with the page at all, the
  // browser allows unmuted playback again.
  const [muted, setMuted] = useState(false);
  const videoRef = useRef(null);

  const { categories } = useCategories();
  // A small limit is enough here — this call only needs qualifying_count to
  // pick the right CTA label, not the items themselves (Bestsellers renders
  // those separately with its own limit).
  const { qualifyingCount } = useBestSellers({ limit: 1 });
  const bestSellerLabel =
    qualifyingCount >= QUALIFYING_THRESHOLD ? "Shop Bestsellers" : "Shop New Arrivals";

  useEffect(() => {
    function applyReducedMotionPreference() {
      const matches = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReducedMotion(matches);
      if (matches) setPlaying(false);
    }
    applyReducedMotionPreference();
  }, []);

  const slideCount = categories.length;
  const activeIndex = slideCount > 0 ? index % slideCount : 0;
  const category = slideCount > 0 ? categories[activeIndex] : null;
  const videoSrc = category ? resolveVideoForCategory(category.category_name) : null;

  const goTo = (i) => {
    if (slideCount === 0) return;
    setIndex((i + slideCount) % slideCount);
  };

  // The video itself drives advancement (onEnded below) rather than a fixed
  // timer, so each category's hero clip always plays out in full before the
  // next one starts.
  const handleVideoEnded = () => goTo(activeIndex + 1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Re-applied on every slide change too: the video element remounts
    // fresh per slide (key below), so the visitor's mute choice needs to
    // be re-synced onto the new element rather than reset to the default.
    video.muted = muted;
    if (!playing) {
      video.pause();
      return;
    }
    video.play().catch(() => {
      // The browser refused unmuted autoplay (no page interaction yet) -
      // fall back to muted so the hero still animates instead of freezing
      // on the first frame. The speaker toggle lets the visitor turn sound
      // back on any time; that click counts as interaction, so it works.
      if (!video.muted) {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      }
    });
  }, [playing, muted, activeIndex, videoSrc]);

  if (slideCount === 0) {
    return (
      <section
        id="top"
        className="relative flex h-[92svh] min-h-[600px] items-center justify-center overflow-hidden bg-ink text-cream"
      />
    );
  }

  return (
    <section
      id="top"
      className="group relative h-[92svh] min-h-[600px] overflow-hidden bg-ink text-cream"
    >
      <div className="absolute inset-0">
        {videoSrc ? (
          <video
            key={`${activeIndex}-${videoSrc}`}
            ref={videoRef}
            src={videoSrc}
            autoPlay={!reducedMotion}
            muted={muted}
            playsInline
            onEnded={handleVideoEnded}
            className="h-full w-full object-cover"
          />
        ) : (
          <Swatch
            tone={getCategoryTone(category.vstitch_category_id)}
            monogram="VN"
            className="h-full w-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/15" />
        <div className="absolute inset-0 bg-ink/20" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8">
        <div key={activeIndex} className="max-w-xl">
          <p className="animate-fade-up font-sans text-xs font-medium tracking-[0.4em] text-gold-light uppercase">
            New Collection
          </p>
          <h1
            className="animate-fade-up mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Shop <span className="italic text-gold-light">{category.category_name}</span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-lg text-base font-light text-cream/85 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {getCategoryQuote(category.category_name)}
          </p>
          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              to={`/collections/${category.vstitch_category_id}`}
              className="inline-flex items-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-gold-light"
            >
              Shop {category.category_name}
            </Link>
            <a
              href="#bestsellers"
              className="inline-flex items-center gap-2 border border-cream/50 px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-cream/10"
            >
              {bestSellerLabel}
            </a>
          </div>
        </div>
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 p-2.5 text-cream opacity-0 transition-opacity duration-300 hover:bg-cream/10 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 p-2.5 text-cream opacity-0 transition-opacity duration-300 hover:bg-cream/10 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-4">
        {slideCount > 1 && (
          <div className="flex items-center gap-2">
            {categories.map((cat, i) => (
              <button
                key={cat.vstitch_category_id}
                type="button"
                aria-label={`Go to slide ${i + 1}: ${cat.category_name}`}
                aria-current={i === activeIndex}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-8 bg-gold-light" : "w-1.5 bg-cream/40 hover:bg-cream/70"
                }`}
              />
            ))}
          </div>
        )}
        {videoSrc && (
          <>
            <button
              type="button"
              aria-label={playing ? "Pause video" : "Play video"}
              onClick={() => setPlaying((p) => !p)}
              className="text-cream/70 transition-colors hover:text-cream"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              aria-label={muted ? "Unmute video" : "Mute video"}
              onClick={() => setMuted((m) => !m)}
              className="text-cream/70 transition-colors hover:text-cream"
            >
              {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
