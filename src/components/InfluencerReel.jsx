import { useEffect, useRef, useState } from "react";
import { InstagramIcon, PlayIcon, VolumeOffIcon, VolumeOnIcon } from "./Icons";

const SLIDE_MS = 1600;

// One influencer collab card (see influencerReels in data/marketing.js), used
// on the /influencers page and on product detail pages.
//
// Plays on hover: a reel (`video`) plays while the pointer is over the card
// and pauses when it leaves; a photo post (`images`) cycles its photos the
// same way. Touch screens have no hover, so a tap toggles play instead.
// Until then the card shows the `poster` / first photo.
//
// Instagram no longer lets its embeds be framed on other sites
// (X-Frame-Options: DENY), so there is no embed fallback: a card with no
// playable media is a "Watch on Instagram" tile linking to the post.
export default function InfluencerReel({ reel }) {
  const [videoFailed, setVideoFailed] = useState(false);

  if (reel.video && !videoFailed) {
    return <ReelVideo reel={reel} onError={() => setVideoFailed(true)} />;
  }
  if (reel.images?.length) {
    return <PhotoReel reel={reel} />;
  }
  return <InstagramTile reel={reel} />;
}

function CreatorBadge({ reel }) {
  return (
    <a
      href={reel.reelUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium text-cream backdrop-blur-sm"
    >
      <InstagramIcon width="14" height="14" />@{reel.creatorHandle}
    </a>
  );
}

function PlayHint({ visible }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/45 text-cream backdrop-blur-sm">
        <PlayIcon width="26" height="26" />
      </span>
    </span>
  );
}

function ReelVideo({ reel, onError }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Sound-on playback can be refused before the visitor has interacted
      // with the page; fall back to muted rather than not playing at all.
      if (!video.muted) {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      }
    });
  };
  const pause = () => videoRef.current?.pause();

  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) play();
  };

  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && play()}
      onPointerLeave={(e) => e.pointerType === "mouse" && pause()}
      onClick={() => (videoRef.current?.paused ? play() : pause())}
      className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[1.75rem] bg-ink shadow-2xl"
    >
      <video
        ref={videoRef}
        src={reel.video}
        poster={reel.poster ?? undefined}
        muted
        loop
        playsInline
        preload={reel.poster ? "none" : "metadata"}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={onError}
        aria-label={`Reel by @${reel.creatorHandle}`}
        className="h-full w-full object-cover"
      />
      <PlayHint visible={!playing} />
      <CreatorBadge reel={reel} />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink/60 text-cream backdrop-blur-sm transition-colors hover:bg-ink/80"
      >
        {muted ? <VolumeOffIcon width="18" height="18" /> : <VolumeOnIcon width="18" height="18" />}
      </button>
    </div>
  );
}

function PhotoReel({ reel }) {
  const { images } = reel;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [playing, images.length]);

  const start = () => {
    // Advance straight away so the hover feels responsive.
    setIndex((i) => (i + 1) % images.length);
    setPlaying(true);
  };

  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && start()}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPlaying(false)}
      onClick={() => (playing ? setPlaying(false) : start())}
      className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[1.75rem] bg-ink shadow-2xl"
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {/* Instagram's photos are square-ish: show each whole, over a
              blurred copy of itself filling the tall card. */}
          <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
          <img
            src={src}
            alt={`@${reel.creatorHandle} wearing VStitch by Anjali Nanda, photo ${i + 1} of ${images.length}`}
            loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      ))}
      <PlayHint visible={!playing} />
      <CreatorBadge reel={reel} />
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-1.5">
        {images.map((src, i) => (
          <span
            key={src}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-cream" : "w-1.5 bg-cream/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

function InstagramTile({ reel }) {
  return (
    <a
      href={reel.reelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex aspect-[9/16] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-charcoal via-ink to-charcoal px-8 text-center text-cream shadow-2xl"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-[1.25rem] border border-gold-light/30" />
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-light/50 text-gold-light transition-colors group-hover:bg-gold-light/10">
        <InstagramIcon width="28" height="28" />
      </span>
      <span className="font-display text-2xl leading-snug">
        Watch on <span className="italic text-gold-light">Instagram</span>
      </span>
      <span className="text-xs font-medium tracking-[0.2em] text-cream/70 uppercase">@{reel.creatorHandle}</span>
    </a>
  );
}
