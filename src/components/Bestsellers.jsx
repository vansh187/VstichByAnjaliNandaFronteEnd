import { products } from "../data/products";
import ProductCard from "./ProductCard";

const bestsellers = products.filter((p) => p.bestseller);

export default function Bestsellers() {
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
          {bestsellers.map((product, i) => (
            <ProductCard key={product.id} product={product} transitionDelay={(i % 4) * 90} />
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
