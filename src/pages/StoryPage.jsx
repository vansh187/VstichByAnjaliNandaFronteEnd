import { useEffect } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { useReveal } from "../hooks/useReveal";
import Swatch from "../components/Swatch";

export default function StoryPage() {
  const revealRef = useReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-cream">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div data-reveal className="reveal">
              <p className="font-sans text-xs font-semibold tracking-[0.32em] text-gold uppercase">
                Our Story
              </p>
              <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Crafted with intention, worn with meaning
              </h1>
              <p className="mt-6 text-base leading-relaxed text-charcoal/80">
                VStitch began as a celebration of slow luxury — where heritage embroidery,
                thoughtful tailoring, and modern femininity meet in every silhouette.
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal/80">
                Founded by Anjali Nanda, the label honours the hands that create each piece
                while shaping contemporary wardrobes that feel timeless and personal.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-sand-dark px-4 py-2 text-sm text-charcoal/70">
                  60+ artisans
                </div>
                <div className="rounded-full border border-sand-dark px-4 py-2 text-sm text-charcoal/70">
                  Hand-finished details
                </div>
                <div className="rounded-full border border-sand-dark px-4 py-2 text-sm text-charcoal/70">
                  Contemporary elegance
                </div>
              </div>
            </div>

            <div data-reveal className="reveal relative overflow-hidden rounded-[2rem] border border-sand-dark/70 bg-ink p-4 shadow-[0_20px_80px_rgba(15,15,15,0.14)]">
              <Swatch
                tone="from-[#5a3d17] via-[#3a332c] to-[#1c1815]"
                monogram="AN"
                className="aspect-[4/5] w-full rounded-[1.5rem]"
              />
              <div className="mt-4 rounded-[1.25rem] border border-cream/20 bg-cream/10 p-5 backdrop-blur-sm">
                <p className="font-display text-xl italic text-cream">
                  “Every drape carries a story — of the hands that wove it, and the woman who wears it.”
                </p>
                <p className="mt-3 text-xs tracking-[0.24em] text-gold-light uppercase">
                  Anjali Nanda, Founder & Lead Designer
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-8 rounded-[2rem] border border-sand-dark/70 bg-white p-8 shadow-sm lg:grid-cols-3 lg:p-10">
            <div>
              <p className="font-sans text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                Heritage
              </p>
              <h2 className="mt-3 font-display text-2xl text-ink">Rooted in craft</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                Each garment is shaped by traditional techniques and preserved through a deeply
                personal design language.
              </p>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                Modernity
              </p>
              <h2 className="mt-3 font-display text-2xl text-ink">Made for now</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                We balance effortless structure with softness, creating pieces that move beautifully
                from day to evening.
              </p>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                Connection
              </p>
              <h2 className="mt-3 font-display text-2xl text-ink">Built around women</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                Our collections celebrate individuality, confidence, and the joy of dressing with
                intention.
              </p>
            </div>
          </div>
        </section>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
