import { useProducts } from "../hooks/useProducts";
import { ProductGridSkeleton } from "./Skeletons";
import StateNotice from "./StateNotice";
import ProductCard from "./ProductCard";

export default function Bestsellers() {
  const { items, loading, error, reload } = useProducts({ inStockOnly: true, limit: 8 });

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

        {loading && <ProductGridSkeleton />}

        {!loading && error && (
          <StateNotice
            title="Couldn't load bestsellers"
            description={error}
            actionLabel="Try Again"
            onAction={reload}
          />
        )}

        {!loading && !error && items.length === 0 && (
          <StateNotice
            title="Nothing to show yet"
            description="Our bestsellers are being restocked — check back soon."
          />
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {items.map((product, i) => (
              <ProductCard
                key={product.vstitch_product_id}
                product={product}
                transitionDelay={(i % 4) * 90}
              />
            ))}
          </div>
        )}

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
