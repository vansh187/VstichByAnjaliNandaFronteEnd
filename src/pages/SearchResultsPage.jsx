import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useProducts } from "../hooks/useProducts";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import StateNotice from "../components/StateNotice";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { ProductGridSkeleton } from "../components/Skeletons";

export default function SearchResultsPage() {
  const revealRef = useReveal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const { items, loading, loadingMore, error, hasMore, loadMore, reload } = useProducts({
    search: query || undefined,
    limit: 24,
  });

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-6 pt-14 sm:px-8">
          <p className="text-[11px] tracking-[0.24em] text-charcoal/60 uppercase">Search</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
            {query ? (
              <>
                Results for <span className="italic text-gold">“{query}”</span>
              </>
            ) : (
              "Search VStitch"
            )}
          </h1>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
          {!query && (
            <StateNotice
              title="Enter a search term"
              description="Use the search icon in the navigation bar to find sarees, lehengas, suits and more."
            />
          )}

          {query && loading && <ProductGridSkeleton />}

          {query && !loading && error && (
            <StateNotice
              title="Couldn't load search results"
              description={error}
              actionLabel="Try Again"
              onAction={reload}
            />
          )}

          {query && !loading && !error && items.length === 0 && (
            <StateNotice
              title="No products found"
              description={`We couldn't find anything matching "${query}". Try a different search term.`}
              actionLabel="Browse All Collections"
              onAction={() => navigate("/collections")}
            />
          )}

          {query && !loading && !error && items.length > 0 && (
            <>
              <p className="mb-6 text-sm text-charcoal/60">
                {items.length} {items.length === 1 ? "result" : "results"}
              </p>
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

          {!query && (
            <div className="mt-8 flex justify-center">
              <Link
                to="/collections"
                className="border border-ink px-9 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
              >
                Browse All Collections
              </Link>
            </div>
          )}
        </section>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
