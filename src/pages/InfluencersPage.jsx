import { Link } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import InfluencerReel from "../components/InfluencerReel";
import { ChevronRightIcon, InstagramIcon } from "../components/Icons";
import { useReveal } from "../hooks/useReveal";
import { useSeo } from "../hooks/useSeo";
import { influencerReels } from "../data/marketing";

// /influencers - every creator collaboration, newest first. Content comes
// from influencerReels in data/marketing.js.
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
        <section className="bg-sand/40">
          <div className="mx-auto max-w-7xl px-5 pb-14 pt-12 text-center sm:px-8">
            <nav className="flex items-center justify-center gap-1.5 text-xs tracking-widest text-charcoal/60 uppercase">
              <Link to="/" className="link-underline">
                Home
              </Link>
              <ChevronRightIcon width="12" height="12" />
              <span className="text-ink">Influencers</span>
            </nav>
            <span className="mt-6 block font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
              Styled by Creators
            </span>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Influencer Collaborations</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-charcoal/75">
              The creators we love, wearing the pieces we make. Tap a reel to watch, then shop the look.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="flex flex-wrap justify-center gap-14">
            {influencerReels.map((reel, i) => (
              <article
                key={reel.id}
                data-reveal
                className="reveal flex w-full max-w-[340px] flex-col"
                style={{ transitionDelay: `${(i % 3) * 90}ms` }}
              >
                <InfluencerReel reel={reel} />
                <span className="mt-6 font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
                  {reel.eyebrow}
                </span>
                <h2 className="mt-2 font-display text-2xl text-ink">{reel.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{reel.copy}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={reel.shopHref}
                    className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal"
                  >
                    {reel.shopLabel}
                  </Link>
                  <a
                    href={reel.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
                  >
                    <InstagramIcon width="14" height="14" />
                    Instagram
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
