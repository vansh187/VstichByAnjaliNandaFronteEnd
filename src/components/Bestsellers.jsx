import { products } from "../data/products";
import { useCart } from "../hooks/useCart";
import { formatINR } from "../utils/format";
import Swatch from "./Swatch";
import { BagIcon } from "./Icons";

export default function Bestsellers() {
  const { addItem } = useCart();

  return (
    <section id="bestsellers" className="bg-sand/60 py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="reveal mb-12 flex flex-col items-start gap-3">
          <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
            Handpicked For You
          </span>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            Our Bestsellers
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {products.map((product, i) => (
            <article
              key={product.id}
              data-reveal
              className="reveal group"
              style={{ transitionDelay: `${(i % 4) * 90}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Swatch
                  tone={product.tone}
                  monogram="VN"
                  className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {product.badge && (
                  <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-medium tracking-widest text-cream uppercase">
                    {product.badge}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      tone: product.tone,
                    })
                  }
                  className="absolute inset-x-3 bottom-3 flex translate-y-14 items-center justify-center gap-2 bg-cream/95 py-3 text-xs font-medium tracking-[0.14em] text-ink uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <BagIcon width="15" height="15" /> Add to Cart
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[11px] tracking-[0.14em] text-charcoal/60 uppercase">
                  {product.category}
                </p>
                <h3 className="mt-1 font-display text-lg text-ink">{product.name}</h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-medium text-ink">{formatINR(product.price)}</span>
                  {product.compareAt && (
                    <span className="text-sm text-charcoal/45 line-through">
                      {formatINR(product.compareAt)}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div data-reveal className="reveal mt-14 flex justify-center">
          <a
            href="#categories"
            className="border border-ink px-9 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
          >
            View Full Collection
          </a>
        </div>
      </div>
    </section>
  );
}
