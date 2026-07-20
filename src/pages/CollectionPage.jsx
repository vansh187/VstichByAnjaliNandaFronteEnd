import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { getCategoryQuote } from "../utils/categoryTheme";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import StateNotice from "../components/StateNotice";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import CategoryVisual from "../components/CategoryVisual";
import { ChevronRightIcon } from "../components/Icons";

export default function CollectionPage() {
  const { categoryId: categoryIdParam } = useParams();
  const categoryId = Number(categoryIdParam);
  const revealRef = useReveal();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useCategories();
  const category = categories.find((c) => c.vstitch_category_id === categoryId);

  const {
    items,
    loading: productsLoading,
    loadingMore,
    error: productsError,
    hasMore,
    loadMore,
    reload: reloadProducts,
  } = useProducts({ categoryId: Number.isFinite(categoryId) ? categoryId : undefined, limit: 24 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  const notFound =
    !categoriesLoading && !categoriesError && Number.isFinite(categoryId) && !category;
  const invalidId = !Number.isFinite(categoryId);

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        {categoriesLoading && (
          <section className="flex h-[46svh] min-h-[340px] animate-pulse items-end bg-sand-dark/40" />
        )}

        {!categoriesLoading && categoriesError && (
          <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
            <StateNotice
              title="Couldn't load this collection"
              description={categoriesError}
              actionLabel="Try Again"
              onAction={reloadCategories}
            />
          </section>
        )}

        {!categoriesLoading && !categoriesError && (invalidId || notFound) && (
          <section className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-32 text-center sm:px-8">
            <h1 className="font-display text-3xl text-ink">Collection Not Found</h1>
            <p className="text-charcoal/70">
              We couldn't find the collection you're looking for.
            </p>
            <Link
              to="/"
              className="mt-2 border border-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              Back to Shop
            </Link>
          </section>
        )}

        {!categoriesLoading && !categoriesError && category && (
          <>
            <section className="relative flex h-[46svh] min-h-[340px] items-end overflow-hidden bg-ink text-cream">
              <CategoryVisual
                category={category}
                className="absolute inset-0 h-full w-full opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 text-left sm:px-8">
                <div className="max-w-xl">
                  <nav className="flex items-center gap-1.5 text-xs tracking-widest text-cream/70 uppercase">
                    <Link to="/" className="link-underline">
                      Home
                    </Link>
                    <ChevronRightIcon width="12" height="12" />
                    <span className="text-cream">{category.category_name}</span>
                  </nav>
                  <h1 className="mt-3 font-display text-4xl sm:text-5xl">
                    {category.category_name}
                  </h1>
                  <p className="mt-4 font-display text-xl italic leading-snug text-cream/90 sm:text-2xl">
                    “{getCategoryQuote(category.category_name)}”
                  </p>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
              {productsLoading && <ProductGridSkeleton />}

              {!productsLoading && productsError && (
                <StateNotice
                  title="Couldn't load products"
                  description={productsError}
                  actionLabel="Try Again"
                  onAction={reloadProducts}
                />
              )}

              {!productsLoading && !productsError && items.length === 0 && (
                <StateNotice
                  title="No products in this collection yet"
                  description="New pieces are added regularly — check back soon."
                />
              )}

              {!productsLoading && !productsError && items.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
                    {items.map((product, i) => (
                      <ProductCard
                        key={product.vstitch_product_id}
                        product={product}
                        transitionDelay={(i % 4) * 90}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-14 flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="border border-ink px-9 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingMore ? "Loading…" : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
