import { categories } from "../data/products";
import Swatch from "./Swatch";
import { ChevronRightIcon } from "./Icons";

export default function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div data-reveal className="reveal mb-12 flex flex-col items-start gap-3">
        <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Shop by Collection
        </span>
        <h2 className="font-display text-4xl text-ink sm:text-5xl">
          Curated for Every Occasion
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <a
            key={cat.id}
            href="#bestsellers"
            data-reveal
            className="reveal group relative aspect-[3/4] overflow-hidden"
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <Swatch
              tone={cat.tone}
              monogram={cat.name.slice(0, 2).toUpperCase()}
              className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div>
                <h3 className="font-display text-2xl text-cream">{cat.name}</h3>
                <p className="mt-1 text-xs tracking-widest text-cream/70 uppercase">
                  {cat.count}
                </p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
                <ChevronRightIcon />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
