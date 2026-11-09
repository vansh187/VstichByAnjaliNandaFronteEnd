import { useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import InfluencerReel from "../components/InfluencerReel";
import { InstagramIcon } from "../components/Icons";
import { useReveal } from "../hooks/useReveal";
import { useSeo } from "../hooks/useSeo";
import { featuredInfluencerReel, influencerReels } from "../data/marketing";

// /influencers - "The Creator Edit". A dark, cinematic opener (the featured
// reel playing softly blurred behind a thin gold frame) followed by one
// editorial spread per collaboration, newest first, alternating sides.
// Content comes from influencerReels in data/marketing.js.

function EditOpener() {
  const backdrop = featuredInfluencerReel?.heroVideo ?? featuredInfluencerReel?.video ?? null;
  const [videoFailed, setVideoFailed] = useState(false);
  // Visitors who asked for less motion get a still frame instead.
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <section className="relative flex h-[78svh] min-h-[520px] items-center justify-center overflow-hidden bg-ink text-cream">
      {backdrop && !videoFailed ? (
        <video
          src={backdrop}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[6px]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-ink to-charcoal" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/90" />
      {/* Thin gold frame - the "lookbook page" border. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-gold-light/30 sm:inset-6" />

      <div className="relative z-10 mx-auto max-w-3xl px-8 text-center">
        <p className="animate-fade-up font-sans text-[11px] font-medium tracking-[0.45em] text-gold-light uppercase">
          VStitch · The Creator Edit
        </p>
        <h1
          className="animate-fade-up mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Styled by <span className="italic text-gold-light">Creators</span>
        </h1>
        <div
          aria-hidden="true"
          className="animate-fade-up mx-auto mt-7 flex items-center justify-center gap-3 text-gold-light"
          style={{ animationDelay: "160ms" }}
        >
          <span className="h-px w-14 bg-gold-light/60" />
          <span className="text-xs">✦</span>
          <span className="h-px w-14 bg-gold-light/60" />
        </div>
        <p
          className="animate-fade-up mx-auto mt-7 max-w-md text-base font-light leading-relaxed text-cream/80 sm:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          Handcrafted pieces, worn by the voices we admire.
        </p>
      </div>

      <a
        href="#films"
        className="absolute inset-x-0 bottom-10 z-10 mx-auto flex w-fit flex-col items-center gap-3 font-sans text-[10px] font-medium tracking-[0.4em] text-cream/70 uppercase transition-colors hover:text-cream sm:bottom-12"
      >
        Watch the films
        <span aria-hidden="true" className="h-10 w-px animate-pulse bg-gradient-to-b from-gold-light to-transparent" />
      </a>
    </section>
  );
}

function CollabSpread({ reel, index }) {
  const chapter = String(index + 1).padStart(2, "0");
  const flipped = index % 2 === 1;

  return (
    <article data-reveal className="reveal grid items-center gap-14 md:grid-cols-2 md:gap-20">
      <div className={`relative mx-auto w-full max-w-[360px] ${flipped ? "md:order-2" : ""}`}>
        {/* Offset gold outline behind the reel. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-4 translate-y-4 rounded-[1.75rem] border border-gold/50"
        />
        <div className="relative">
          <InfluencerReel reel={reel} />
        </div>
      </div>

      <div className={`text-center md:text-left ${flipped ? "md:order-1" : ""}`}>
        <div className="flex items-baseline justify-center gap-4 md:justify-start">
          <span className="font-display text-7xl leading-none text-gold/35 lining-nums">{chapter}</span>
          <span className="font-sans text-[11px] font-medium tracking-[0.4em] text-gold uppercase">
            Chapter {chapter}
          </span>
        </div>
        <p className="mt-8 font-sans text-xs font-medium tracking-[0.3em] text-charcoal/60 uppercase">{reel.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
          VStitch <span className="italic text-gold">× @{reel.creatorHandle}</span>
        </h2>
        <span aria-hidden="true" className="mx-auto mt-6 block h-px w-16 bg-gold/60 md:mx-0" />
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-charcoal/75 md:mx-0">{reel.copy}</p>
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-start">
          <Link
            to={reel.shopHref}
            className="bg-ink px-9 py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
          >
            {reel.shopLabel}
          </Link>
          <a
            href={reel.reelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline flex items-center gap-2 py-3 text-xs font-medium tracking-[0.2em] text-ink uppercase"
          >
            <InstagramIcon width="15" height="15" />@{reel.creatorHandle}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function InfluencersPage() {
  const revealRef = useReveal();

  useSeo({
    title: "Influencer Collaborations | VStitch by Anjali Nanda",
    description:
      "See how creators style VStitch by Anjali Nanda - watch our latest influencer collaborations and shop the looks.",
    path: "/influencers",
  });

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <EditOpener />

        <section id="films" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
          <div className="space-y-28 lg:space-y-36">
            {influencerReels.map((reel, i) => (
              <CollabSpread key={reel.id} reel={reel} index={i} />
            ))}
          </div>
        </section>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
