import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import StateNotice from "../components/StateNotice";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { ChevronRightIcon } from "../components/Icons";
import { useReveal } from "../hooks/useReveal";
import { useSeo } from "../hooks/useSeo";
import { useCollection } from "../hooks/useCollection";
import { FRONTEND_BASE_URL } from "../lib/apiConfig";

const SLUG = "summer-luxe";

export default function SummerLuxePage() {
  const revealRef = useReveal();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  const {
    collection,
    items,
    loading,
    loadingMore,
    error,
    notFound,
    hasMore,
    loadMore,
    reload,
  } = useCollection(SLUG);

  const heroImage = useMemo(() => {
    const images = collection?.images ?? [];
    const primary = images.find((img) => img.is_primary) ?? images[0];
    return primary?.image_url;
  }, [collection]);

  const title = collection?.collection_name ?? "Summer Luxe";
  const description =
    collection?.subtitle ||
    collection?.description ||
    "A hand-picked edit of our airiest, most elegant pieces from VStitch by Anjali Nanda.";

  const breadcrumbJsonLd = useMemo(() => {
    if (!collection) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${FRONTEND_BASE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: `${FRONTEND_BASE_URL}/${SLUG}`,
        },
      ],
    };
  }, [collection, title]);

  useSeo({
    title: `${title} | VStitch by Anjali Nanda`,
    description,
    path: `/${SLUG}`,
    image: heroImage,
    jsonLd: breadcrumbJsonLd,
  });

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        {loading && (
          <section className="flex h-[46svh] min-h-[340px] animate-pulse items-end bg-sand-dark/40" />
        )}

        {!loading && notFound && (
          <section className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-32 text-center sm:px-8">
            <h1 className="font-display text-3xl text-ink">Collection Not Found</h1>
            <p className="text-charcoal/70">
              The Summer Luxe edit isn't available right now — explore our full collections instead.
            </p>
            <Link
              to="/collections"
              className="mt-2 border border-ink px-8 py-3 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
            >
              Browse Collections
            </Link>
          </section>
        )}

        {!loading && !notFound && error && (
          <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
            <StateNotice
              title="Couldn't load this collection"
              description={error}
              actionLabel="Try Again"
              onAction={reload}
            />
          </section>
        )}

        {!loading && !notFound && !error && collection && (
          <>
            <section className="relative flex h-[92svh] min-h-[600px] items-end overflow-hidden bg-ink text-cream">
              {heroImage && !imageFailed ? (
                <img
                  src={heroImage}
                  alt={title}
                  onError={() => setImageFailed(true)}
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-ink to-charcoal" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 text-left sm:px-8">
                <div className="max-w-xl">
                  <nav className="flex items-center gap-1.5 text-xs tracking-widest text-cream/70 uppercase">
                    <Link to="/" className="link-underline">
                      Home
                    </Link>
                    <ChevronRightIcon width="12" height="12" />
                    <span className="text-cream">{title}</span>
                  </nav>
                  <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
                  {collection.subtitle && (
                    <p className="mt-4 font-display text-xl italic leading-snug text-cream/90 sm:text-2xl">
                      {collection.subtitle}
                    </p>
                  )}
                  {collection.description && (
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-cream/80">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
              {items.length === 0 ? (
                <StateNotice
                  title="No pieces in this edit yet"
                  description="The Summer Luxe collection is being curated — check back soon."
                  actionLabel="Browse Collections"
                  onAction={() => navigate("/collections")}
                />
              ) : (
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
