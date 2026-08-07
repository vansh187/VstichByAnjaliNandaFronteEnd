export default function Story() {
  return (
    <section id="story" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div
          data-reveal
          className="reveal relative aspect-[4/5] overflow-hidden lg:order-2"
        >
          <img
            src="/static/brand/founder.jpg"
            alt="Anjali Nanda, Founder & Lead Designer"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute bottom-6 left-6 right-6 border border-cream/25 bg-ink/40 p-5 backdrop-blur-sm">
            <p className="font-display text-xl italic text-cream">
              “Every drape carries a story — of the hands that wove it, and the
              woman who wears it.”
            </p>
            <p className="mt-3 text-xs tracking-widest text-gold-light uppercase">
              Anjali Nanda, Founder &amp; Lead Designer
            </p>
          </div>
        </div>

        <div data-reveal className="reveal lg:order-1" style={{ transitionDelay: "100ms" }}>
          <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
            Our Story
          </span>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Where Heritage Meets the Modern Wardrobe
          </h2>
          <p className="mt-6 text-base leading-relaxed text-charcoal/80">
            VStitch began in a small Delhi atelier in 2014, where Anjali Nanda
            set out to preserve the vanishing art of hand embroidery while
            designing for the modern woman. Today, every piece is still cut,
            embroidered and finished by a close-knit collective of over 60
            artisans across Uttar Pradesh, Gujarat and West Bengal.
          </p>
          <p className="mt-4 text-base leading-relaxed text-charcoal/80">
            No two pieces are ever quite the same — because no two hands
            stitch alike. That's the promise behind every VStitch garment.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-6 border-t border-sand-dark pt-8">
            <div>
              <p className="font-display text-3xl text-ink">60+</p>
              <p className="mt-1 text-xs tracking-widest text-charcoal/60 uppercase">
                Artisans
              </p>
            </div>
            <div>
              <p className="font-display text-3xl text-ink">12k+</p>
              <p className="mt-1 text-xs tracking-widest text-charcoal/60 uppercase">
                Garments Made
              </p>
            </div>
            <div>
              <p className="font-display text-3xl text-ink">10+</p>
              <p className="mt-1 text-xs tracking-widest text-charcoal/60 uppercase">
                Years of Craft
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
