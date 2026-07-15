import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { categories, products } from "../data/products";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import Swatch from "../components/Swatch";
import { ChevronRightIcon } from "../components/Icons";

export default function CollectionPage() {
  const { categoryId } = useParams();
  const revealRef = useReveal();
  const category = categories.find((c) => c.id === categoryId);
  const items = category ? products.filter((p) => p.categoryId === categoryId) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        {category ? (
          <>
            <section className="relative flex h-[46svh] min-h-[340px] items-end overflow-hidden bg-ink text-cream">
              <Swatch
                tone={category.tone}
                monogram={category.name.slice(0, 2).toUpperCase()}
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
                    <span className="text-cream">{category.name}</span>
                  </nav>
                  <h1 className="mt-3 font-display text-4xl sm:text-5xl">{category.name}</h1>
                  {category.quote && (
                    <p className="mt-4 font-display text-xl italic leading-snug text-cream/90 sm:text-2xl">
                      “{category.quote}”
                    </p>
                  )}
                  <p className="mt-4 text-sm tracking-widest text-gold-light uppercase">
                    {items.length} {items.length === 1 ? "piece" : "pieces"}
                  </p>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
                {items.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    transitionDelay={(i % 4) * 90}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
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
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
