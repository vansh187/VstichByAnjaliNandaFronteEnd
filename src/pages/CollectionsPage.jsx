import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useCategories } from "../hooks/useCategories";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import CategoryVisual from "../components/CategoryVisual";
import StateNotice from "../components/StateNotice";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { ChevronRightIcon } from "../components/Icons";

export default function CollectionsPage() {
  const revealRef = useReveal();
  const { categories, loading, error, reload } = useCategories();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-ink text-cream">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_40%)]" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-28">
            <div className="max-w-2xl">
              <p className="font-sans text-xs font-semibold tracking-[0.32em] text-gold-light uppercase">
                Collections
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
                Discover heirloom-inspired pieces by category
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/80">
                Browse each curated collection to explore signature silhouettes, refined colors,
                and carefully crafted sizes with easy add-to-cart selection.
              </p>
            </div>
            <div className="rounded-full border border-cream/20 bg-cream/10 px-4 py-2 text-sm tracking-[0.2em] text-cream/80 uppercase backdrop-blur-sm">
              {categories.length} curated categories
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          {loading && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] animate-pulse rounded-2xl bg-sand-dark/50"
                />
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, index) => (
                <Link
                  key={cat.vstitch_category_id}
                  to={`/collections/${cat.vstitch_category_id}`}
                  data-reveal
                  className="reveal group overflow-hidden rounded-[1.75rem] border border-sand-dark/70 bg-cream"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <CategoryVisual
                      category={cat}
                      className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                      <div>
                        <p className="text-[11px] tracking-[0.24em] text-cream/75 uppercase">
                          Collection
                        </p>
                        <h2 className="mt-1 font-display text-2xl text-cream">{cat.category_name}</h2>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
                        <ChevronRightIcon />
                      </span>
                    </div>
                  </div>
                </Link>
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
