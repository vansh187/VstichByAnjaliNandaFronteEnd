import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { useReveal } from "../hooks/useReveal";
import { useSeo } from "../hooks/useSeo";

export default function StoryPage() {
  const revealRef = useReveal();

  useSeo({
    title: "Our Story | VStitch by Anjali Nanda",
    description:
      "VStitch by Anjali Nanda is a slow-luxury Indian couture label founded by Anjali Nanda, crafting handcrafted sarees, suits and bespoke bridal wear with 60+ artisans.",
    path: "/our-story",
  });

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-cream">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.85fr] lg:items-start lg:gap-8 lg:pt-16 lg:pb-20">
            <div data-reveal className="reveal pt-2 lg:pt-4">
              <p className="font-sans text-xs font-semibold tracking-[0.32em] text-gold uppercase">
                Our Story
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Crafted with intention, worn with meaning
              </h1>
              <p className="mt-5 text-base leading-relaxed text-charcoal/80">
                VStitch began as a celebration of slow luxury — where heritage embroidery,
                thoughtful tailoring, and modern femininity meet in every silhouette.
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal/80">
                Founded by Anjali Nanda, the label honours the hands that create each piece
                while shaping contemporary wardrobes that feel timeless and personal.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
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

            <div data-reveal className="reveal mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.5rem] border border-sand-dark/70 bg-ink p-2.5 shadow-[0_20px_80px_rgba(15,15,15,0.14)] lg:justify-self-end">
              <img
                src="/static/brand/founder.jpg"
                alt="Anjali Nanda, Founder & Lead Designer"
                className="aspect-[4/5] w-full rounded-[1rem] object-cover object-top"
              />
              <div className="mt-2 rounded-[0.9rem] border border-cream/20 bg-cream/10 p-3 backdrop-blur-sm">
                <p className="font-display text-sm italic text-cream sm:text-base">
                  “Every drape carries a story — of the hands that wove it, and the woman who wears it.”
                </p>
                <p className="mt-1.5 text-[10px] tracking-[0.24em] text-gold-light uppercase sm:text-[11px]">
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
