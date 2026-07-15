import { instagramTiles } from "../data/products";
import Swatch from "./Swatch";
import { InstagramIcon } from "./Icons";

export default function InstagramGallery() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div data-reveal className="reveal mb-10 flex flex-col items-center gap-3 text-center">
        <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Follow the Journey
        </span>
        <h2 className="font-display text-4xl text-ink sm:text-5xl">@vstitchbyanjalinanda</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {instagramTiles.map((tile, i) => (
          <a
            key={tile.id}
            href="#"
            data-reveal
            className="reveal group relative aspect-square overflow-hidden"
            style={{ transitionDelay: `${i * 60}ms` }}
            aria-label="View on Instagram"
          >
            <Swatch
              tone={tile.tone}
              monogram="VN"
              className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
              <InstagramIcon width="22" height="22" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
