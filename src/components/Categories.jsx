import { useRef } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { CategoryGridSkeleton } from "./Skeletons";
import StateNotice from "./StateNotice";
import CategoryTileMedia from "./CategoryTileMedia";
import { ChevronRightIcon } from "./Icons";
import { resolveCategoryMedia, withBrandPrefix } from "../utils/categoryVideo";

// Desktop (lg, 3 columns) leftover after pulling the odd tile out as a
// featured banner: an even regular count mod 3 is always 0, 1, or 2, so the
// banner spans exactly enough columns to finish that row instead of leaving
// empty grid cells beside the last regular tile. Static class names (not a
// template literal) so Tailwind's build-time scanner can see them.
const LG_BANNER_SPAN = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3" };

function CategoryTile({ category, index, featured = false }) {
  const containerRef = useRef(null);
  const media = resolveCategoryMedia(category.category_name);

  return (
    <Link
      ref={containerRef}
      to={`/collections/${category.vstitch_category_id}`}
      data-reveal
      className={`reveal group relative block h-full w-full overflow-hidden ${
        featured ? "aspect-[16/9] sm:aspect-[21/8]" : "aspect-[4/5]"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <CategoryTileMedia
        category={category}
        media={media}
        containerRef={containerRef}
        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent opacity-90 transition-opacity duration-500 lg:opacity-60 lg:group-hover:opacity-95" />

      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-6 ${
          featured ? "items-start text-left" : ""
        }`}
      >
        <div>
          <h3 className={`font-display text-cream ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
            {withBrandPrefix(category.category_name)}
          </h3>
          {media.tagline && (
            <p className="mt-1 text-sm text-cream/80">{media.tagline}</p>
          )}
        </div>

        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cream/90 px-5 py-2 text-xs font-medium tracking-[0.2em] text-ink uppercase opacity-100 transition-all duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
        >
          Shop Now
          <ChevronRightIcon width="14" height="14" />
        </span>
      </div>
    </Link>
  );
}

export default function Categories() {
  const { categories, loading, error, reload } = useCategories();

  const isOdd = categories.length % 2 === 1;
  const regular = isOdd ? categories.slice(0, -1) : categories;
  const featured = isOdd ? categories[categories.length - 1] : null;

  const desktopRemainder = regular.length % 3;
  const bannerLgSpan = LG_BANNER_SPAN[desktopRemainder === 0 ? 3 : 3 - desktopRemainder];

  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div data-reveal className="reveal mb-12 flex flex-col items-start gap-3">
        <span className="font-sans text-xs font-medium tracking-[0.3em] text-gold uppercase">
          Shop by Collection
        </span>
        <h2 className="font-display text-4xl text-ink sm:text-5xl">
          Curated for Every Occasion
        </h2>
      </div>

      {loading && <CategoryGridSkeleton />}

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
          description="Check back soon — new collections are on the way."
        />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {regular.map((cat, i) => (
            <div
              key={cat.vstitch_category_id}
              className="w-[78%] shrink-0 snap-center sm:w-auto sm:shrink sm:snap-align-none"
            >
              <CategoryTile category={cat} index={i} />
            </div>
          ))}
          {featured && (
            <div
              className={`w-[92%] shrink-0 snap-center sm:w-auto sm:shrink sm:snap-align-none sm:col-span-2 ${bannerLgSpan}`}
            >
              <CategoryTile category={featured} index={regular.length} featured />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
