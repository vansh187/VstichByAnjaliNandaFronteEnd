import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import StateNotice from "../components/StateNotice";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { ProductGridSkeleton } from "../components/Skeletons";
import CollectionHeroVideo from "../components/CollectionHeroVideo";

function CategoryProductsSection({ category, index }) {
  const { items, loading, error, reload } = useProducts({
    categoryId: category.vstitch_category_id,
    limit: 24,
  });

  return (
    <section
      data-reveal
      className="reveal rounded-[1.5rem] border border-sand-dark/70 bg-cream p-6 shadow-sm sm:p-8"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.24em] text-charcoal/60 uppercase">Collection</p>
          <h2 className="mt-1 font-display text-2xl text-ink">{category.category_name}</h2>
        </div>
        <Link
          to={`/collections/${category.vstitch_category_id}`}
          className="text-sm font-medium tracking-[0.16em] text-gold uppercase transition-colors hover:text-ink"
        >
          View Collection
        </Link>
      </div>

      {loading && <ProductGridSkeleton />}

      {!loading && error && (
        <StateNotice
          title="Couldn't load products"
          description={error}
          actionLabel="Try Again"
          onAction={reload}
        />
      )}

      {!loading && !error && items.length === 0 && (
        <StateNotice
          title="No products yet"
          description="New pieces are being added to this collection soon."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((product, productIndex) => (
            <ProductCard
              key={product.vstitch_product_id}
              product={product}
              transitionDelay={productIndex * 70}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CollectionsPage() {
  const revealRef = useReveal();
  const { categories, loading, error, reload } = useCategories();
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="relative flex h-[92svh] min-h-[600px] items-end overflow-hidden bg-ink text-cream">
          {!videoFailed && (
            <CollectionHeroVideo
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 h-full w-full object-contain opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-sans text-xs font-semibold tracking-[0.32em] text-gold-light uppercase">
                Collections
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
                Browse every collection with its full range of pieces
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/80">
                Each category section below shows the products available for that collection,
                including colors, sizes, and add-to-cart options.
              </p>
            </div>
            <div className="rounded-full border border-cream/20 bg-cream/10 px-4 py-2 text-sm tracking-[0.2em] text-cream/80 uppercase backdrop-blur-sm">
              {categories.length} curated categories
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          {loading && (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-sand-dark/70 bg-cream p-6 sm:p-8"
                >
                  <div className="h-8 w-48 animate-pulse rounded bg-sand-dark/50" />
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, cardIndex) => (
                      <div
                        key={cardIndex}
                        className="aspect-[3/4] animate-pulse rounded-2xl bg-sand-dark/50"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <StateNotice
              title="Couldn't load collections"
              description={error}
              actionLabel="Try Again"
              onAction={reload}
            />
          )}

          {!loading && !error && categories.length === 0 && (
            <StateNotice
              title="No collections yet"
              description="New collections are being added regularly."
            />
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="space-y-8">
              {categories.map((cat, index) => (
                <CategoryProductsSection key={cat.vstitch_category_id} category={cat} index={index} />
              ))}
            </div>
          )}
        </section>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
