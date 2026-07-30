import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "./Icons";
import { useCategories } from "../hooks/useCategories";
import { useBestSellers } from "../hooks/useBestSellers";
import { QUALIFYING_THRESHOLD } from "./Bestsellers";

// Placeholder lifestyle photography — swap `image` for real campaign shoots at integration time.
// `categoryKeywords` picks which real (API-driven) category this slide's
// shop-now button should point to — matched against live category names,
// never a hardcoded category id, so it keeps working as categories are
// added/renamed/removed on the backend.
const slides = [
  {
    image: "https://picsum.photos/id/64/1800/1000",
    alt: "Model draped in a hand-embroidered ensemble inside a heritage haveli",
    eyebrow: "Heirloom Craftsmanship · Est. 2014",
    title: "Discover Your",
    highlight: "Signature Look",
    subtitle:
      "Hand-embroidered sarees and bridal couture, designed by Anjali Nanda and stitched by master artisans across India.",
    categoryKeywords: ["saree"],
  },
  {
    image: "https://picsum.photos/id/26/1800/1000",
    alt: "Bridal couture detail with zardozi hand embroidery",
    eyebrow: "The Bridal Edit",
    title: "Every Thread Tells",
    highlight: "A Story",
    subtitle:
      "Zardozi, mirror-work and hand embroidery — heirlooms cut and stitched for your big day.",
    categoryKeywords: ["lehenga", "bridal"],
  },
  {
    image: "https://picsum.photos/id/106/1800/1000",
    alt: "Flowing silk saree in motion",
    eyebrow: "The Festive Edit",
    title: "Drape Yourself In",
    highlight: "Timeless Elegance",
    subtitle:
      "Kanjivaram and Banarasi silks, woven with centuries of tradition and finished by hand.",
    categoryKeywords: ["saree"],
  },
  {
    image: "https://picsum.photos/id/177/1800/1000",
    alt: "Indo-western co-ord set styled for the modern wardrobe",
    eyebrow: "Indo-Western",
    title: "Tradition, Cut For",
    highlight: "The Modern You",
    subtitle:
      "Contemporary silhouettes rooted in Indian craft — for the woman who wears both worlds well.",
    categoryKeywords: ["indo", "western", "kurti", "suit"],
  },
];

const AUTOPLAY_MS = 5500;

function findMatchingCategory(categories, keywords, fallbackIndex) {
  if (categories.length === 0) return null;

  const match = categories.find((cat) =>
    keywords.some((keyword) => cat.category_name.toLowerCase().includes(keyword)),
  );

  return match ?? categories[fallbackIndex % categories.length];
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reducedMotionRef = useRef(false);

  const { categories } = useCategories();
  // A small limit is enough here — this call only needs qualifying_count to
  // pick the right CTA label, not the items themselves (Bestsellers renders
  // those separately with its own limit).
  const { qualifyingCount } = useBestSellers({ limit: 1 });
  const bestSellerLabel =
    qualifyingCount >= QUALIFYING_THRESHOLD ? "Shop Bestsellers" : "Shop New Arrivals";

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotionRef.current) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing]);

  const goTo = (i) => setIndex((i + slides.length) % slides.length);
  const slide = slides[index];
  const slideCategory = findMatchingCategory(categories, slide.categoryKeywords, index);

  return (
    <section
      id="top"
      className="group relative h-[92svh] min-h-[600px] overflow-hidden bg-ink text-cream"
    >
      {slides.map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image}
            alt={s.alt}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            className={`h-full w-full object-cover ${i === index ? "kenburns-active" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/15" />
          <div className="absolute inset-0 bg-ink/20" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8">
        <div key={index} className="max-w-xl">
          <p className="animate-fade-up font-sans text-xs font-medium tracking-[0.4em] text-gold-light uppercase">
            {slide.eyebrow}
          </p>
          <h1
            className="animate-fade-up mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {slide.title} <span className="italic text-gold-light">{slide.highlight}</span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-lg text-base font-light text-cream/85 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {slide.subtitle}
          </p>
          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            {slideCategory && (
              <Link
                to={`/collections/${slideCategory.vstitch_category_id}`}
                className="inline-flex items-center gap-2 bg-gold px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-gold-light"
              >
                Shop {slideCategory.category_name}
              </Link>
            )}
            <a
              href="#bestsellers"
              className="inline-flex items-center gap-2 border border-cream/50 px-8 py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-cream/10"
            >
              {bestSellerLabel}
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 p-2.5 text-cream opacity-0 transition-opacity duration-300 hover:bg-cream/10 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 p-2.5 text-cream opacity-0 transition-opacity duration-300 hover:bg-cream/10 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
      >
        <ChevronRightIcon />
      </button>

      <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${s.title} ${s.highlight}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-gold-light" : "w-1.5 bg-cream/40 hover:bg-cream/70"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          onClick={() => setPlaying((p) => !p)}
          className="text-cream/70 transition-colors hover:text-cream"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </section>
  );
}
