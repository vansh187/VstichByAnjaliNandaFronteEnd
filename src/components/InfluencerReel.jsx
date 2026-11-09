import { useRef, useState } from "react";
import { InstagramIcon, VolumeOffIcon, VolumeOnIcon } from "./Icons";

// One influencer collab reel (see influencerReels in data/marketing.js),
// used by the home-page hero and the /influencers page. `iframeClassName`
// sets the embed's height, since Instagram's embed doesn't size itself
// without their script.
export default function InfluencerReel({ reel, iframeClassName = "h-[620px] sm:h-[640px]" }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  // Missing/unplayable MP4 -> fall back to the Instagram embed below.
  const [videoFailed, setVideoFailed] = useState(false);

  // Self-hosted copy: autoplays muted (browsers only allow muted autoplay),
  // with a button to turn the sound on.
  if (reel.video && !videoFailed) {
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
          onError={() => setVideoFailed(true)}
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
        className={`block w-full ${iframeClassName}`}
      />
    </div>
  );
}
