import { useBestSellers } from "../hooks/useBestSellers";
import { ProductGridSkeleton } from "./Skeletons";
import StateNotice from "./StateNotice";
import ProductCard from "./ProductCard";

// Exported so Hero's own "Shop Bestsellers"/"Shop New Arrivals" CTA label
// stays in sync with the same rule this section uses to pick its heading.
export const QUALIFYING_THRESHOLD = 3;

// limit is exposed as a prop so this section can be resized (e.g. a wider
// homepage layout or a dedicated "Best Sellers" page) without touching the
// data layer — the API already supports 1-50 via the same query param.
export default function Bestsellers({ limit = 10 }) {
  const { items, qualifyingCount, loading, error, reload } = useBestSellers({ limit });

  const isProvenBestSellers = qualifyingCount >= QUALIFYING_THRESHOLD;
  const eyebrow = isProvenBestSellers ? "Handpicked For You" : "Fresh In";
  const heading = isProvenBestSellers ? "Our Bestsellers" : "New Arrivals";

  // Not enough sales history yet and no fallback items either — nothing
  // worth showing, so skip the section rather than render an empty shell.
  if (!loading && !error && items.length === 0) return null;

  return (
    <section id="bestsellers" className="bg-sand/60 py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="reveal mb-12 flex flex-col items-start gap-3">
          <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
            {eyebrow}
          </span>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">{heading}</h2>
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
            href="/collections"
            className="border border-ink px-9 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
          >
            View Full Collection
          </a>
        </div>
      </div>
    </section>
  );
}
