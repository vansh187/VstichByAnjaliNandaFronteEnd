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
import { useAuth } from "../hooks/useAuth";
import { QUALIFYING_THRESHOLD } from "./Bestsellers";
import { getCategoryTone, getCategoryQuote } from "../utils/categoryTheme";
import { formatDisplayName } from "../utils/formatName";
import { resolveVideoForCategory } from "../utils/categoryVideo";
import { featuredInfluencerReel as reel } from "../data/marketing";
import InfluencerReel from "./InfluencerReel";

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
  // True only while sound is muted *because the browser blocked autoplay*,
  // as opposed to the visitor having chosen mute themselves — lets the
  // first-interaction listener below know whether it's safe to turn sound
  // back on automatically without overriding an explicit user choice.
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef(null);
  const muteButtonRef = useRef(null);

  const { categories } = useCategories();
  // A small limit is enough here — this call only needs qualifying_count to
  // pick the right CTA label, not the items themselves (Bestsellers renders
  // those separately with its own limit).
  const { qualifyingCount } = useBestSellers({ limit: 1 });
  const bestSellerLabel =
    qualifyingCount >= QUALIFYING_THRESHOLD ? "Shop Bestsellers" : "Shop New Arrivals";

  // Same video hero for logged-in and logged-out visitors alike - only the
  // eyebrow text is personalized, so signed-in users aren't stuck with the
  // old static-image WelcomeBanner just because they're authenticated.
  const { user, isAuthenticated } = useAuth();
  const eyebrow = isAuthenticated ? `Welcome back, ${formatDisplayName(user?.username)}` : "New Collection";

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
        setAutoplayBlocked(true);
        video.play().catch(() => {});
      }
    });
  }, [playing, muted, activeIndex, videoSrc]);

  // Once the browser has blocked unmuted autoplay, the very next click,
  // tap, or key press anywhere on the page (not just the speaker icon)
  // counts as the interaction browsers require - so turn sound on right
  // then instead of making the visitor go hunt for the mute button.
  //
  // Interactions on the mute button itself are deliberately excluded: a
  // "pointerdown" on it fires (and this listener runs) before the button's
  // own "click" handler, so setMuted(false) here would already have
  // committed by the time the click handler's setMuted((m) => !m) runs -
  // flipping sound straight back off. The mute button manages its own
  // muted/autoplayBlocked state directly, so this listener only needs to
  // handle every *other* interaction on the page.
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
            className="h-full w-full bg-ink object-contain"
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

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-between gap-10 px-5 sm:px-8 lg:px-16">
        <div className="flex flex-col">
        <div key={activeIndex} className="max-w-xl">
          <p className="animate-fade-up font-sans text-xs font-medium tracking-[0.4em] text-gold-light uppercase">
            {eyebrow}
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

        {/* Phones/tablets: a full reel would swallow the hero, so the
            featured collab is a compact link to /influencers instead. */}
        {reel && (
          <Link
            to="/influencers"
            className="animate-fade-up mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-cream/30 bg-ink/40 py-2 pl-2 pr-5 backdrop-blur-sm transition-colors hover:bg-ink/60 lg:hidden"
            style={{ animationDelay: "320ms" }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
              <PlayIcon width="14" height="14" />
            </span>
            <span className="flex flex-col text-left">
              <span className="text-[10px] font-medium tracking-[0.25em] text-gold-light uppercase">
                {reel.eyebrow}
              </span>
              <span className="text-sm text-cream">Watch {reel.title}</span>
            </span>
          </Link>
        )}
        </div>

        {/* Desktop: the featured influencer reel, playable right in the hero.
            Outside the per-slide key so it doesn't reload on every slide. */}
        {reel && (
          <aside className="hidden w-[300px] shrink-0 lg:block">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-medium tracking-[0.3em] text-gold-light uppercase">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold-light" aria-hidden="true" />
              {reel.eyebrow}
            </p>
            <InfluencerReel reel={reel} iframeClassName="h-[540px]" />
            <Link
              to="/influencers"
              className="link-underline mt-3 inline-block text-xs font-medium tracking-[0.2em] text-cream/80 uppercase hover:text-cream"
            >
              More collaborations
            </Link>
          </aside>
        )}
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
              ref={muteButtonRef}
              type="button"
              aria-label={muted ? "Unmute video" : "Mute video"}
              onClick={() => {
                setAutoplayBlocked(false);
                setMuted((m) => !m);
              }}
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
