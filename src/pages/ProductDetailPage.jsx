import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StateNotice from "../components/StateNotice";
import Swatch from "../components/Swatch";
import SizeGuideModal from "../components/SizeGuideModal";
import CustomizationModal from "../components/CustomizationModal";
import {
  BagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
} from "../components/Icons";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useOverlay } from "../hooks/useOverlay";
import { useSwipe } from "../hooks/useSwipe";
import { useSeo } from "../hooks/useSeo";
import { getProductDetail } from "../lib/catalogApi";
import { FRONTEND_BASE_URL } from "../lib/apiConfig";
import { formatINR } from "../utils/format";
import { colorToHex } from "../utils/colorSwatch";
import { getCategoryTone } from "../utils/categoryTheme";
import { sortSizes } from "../utils/variants";

// Custom-fit requests are keyed by variant id and persisted here so the
// "Custom" badge and the entered measurements survive a page reload — the
// backend has no GET endpoint yet to fetch a user's past requests.
const CUSTOM_FIT_STORAGE_KEY = "vstitch_custom_fit_requests";

function readCustomFitStore() {
  try {
    const raw = localStorage.getItem(CUSTOM_FIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCustomFitStore(store) {
  try {
    localStorage.setItem(CUSTOM_FIT_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable (private browsing, quota) — request still
    // succeeded server-side, so fail silently rather than blocking the UI.
  }
}

export default function ProductDetailPage() {
  const { productId: productIdParam } = useParams();
  const productId = Number(productIdParam);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { token } = useAuth();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [manualSize, setManualSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  // variantId -> { values, result } for any custom-fit request already
  // submitted this session (rehydrated from localStorage on load).
  const [customRequests, setCustomRequests] = useState(() => readCustomFitStore());

  const handleCustomizeSubmitted = useCallback(({ variantId, values, result }) => {
    setCustomRequests((prev) => {
      const next = { ...prev, [variantId]: { values, result } };
      writeCustomFitStore(next);
      return next;
    });
  }, []);

  const validId = Number.isFinite(productId) && productId > 0;

  const closeLightbox = () => setLightboxOpen(false);
  useOverlay(lightboxOpen, closeLightbox);

  // Page is remounted (key={location.pathname} in App.jsx) whenever the
  // product id in the URL changes, so every piece of state above already
  // starts fresh — this effect only needs to run the fetch itself.
  useEffect(() => {
    if (!validId) return undefined;

    let active = true;

    async function loadDetail() {
      try {
        const data = await getProductDetail(productId);
        if (!active) return;
        setDetail(data);
      } catch (err) {
        if (!active) return;
        setError(err.message || "We couldn't load this product right now.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [productId, validId]);

  const images = useMemo(() => {
    if (!detail) return [];
    return [...detail.images].sort((a, b) => a.display_order - b.display_order);
  }, [detail]);

  const availableColors = useMemo(() => {
    if (!detail) return [];
    return [...new Set(detail.variants.map((v) => v.color))];
  }, [detail]);

  // Derived at render time (not synced via effect): whatever the user
  // explicitly picked, as long as it's still a real option for this
  // product, otherwise the first available color once data has loaded.
  const effectiveColor =
    selectedColor && availableColors.includes(selectedColor) ? selectedColor : availableColors[0] ?? null;

  const variantsForColor = useMemo(() => {
    if (!detail) return [];
    const variants = effectiveColor
      ? detail.variants.filter((v) => v.color === effectiveColor)
      : detail.variants;
    return sortSizes(variants);
  }, [detail, effectiveColor]);

  const autoSize = variantsForColor.find((v) => v.stock_quantity > 0)?.size ?? "";
  const selectedSize =
    manualSize && variantsForColor.some((v) => v.size === manualSize) ? manualSize : autoSize;
  const selectedVariant = variantsForColor.find((v) => v.size === selectedSize) ?? null;
  const currentCustomRequest = selectedVariant
    ? customRequests[selectedVariant.vstitch_product_variant_id]
    : null;

  const inStock = detail ? detail.variants.some((v) => v.stock_quantity > 0) : false;
  const canOrder = inStock && selectedVariant && selectedVariant.stock_quantity > 0;
  const maxQty = selectedVariant ? Math.min(selectedVariant.stock_quantity, 10) : 1;

  const priceLabel = useMemo(() => {
    if (!detail || detail.variants.length === 0) return "";
    const prices = detail.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatINR(min) : `${formatINR(min)} – ${formatINR(max)}`;
  }, [detail]);

  // Truncated to ~155 chars, the practical length before Google starts
  // clipping a meta description in search results.
  const metaDescription = useMemo(() => {
    if (!detail) return undefined;
    const base = detail.description || `Handcrafted ${detail.category_name} by VStitch by Anjali Nanda.`;
    return base.length > 155 ? `${base.slice(0, 154).trimEnd()}…` : base;
  }, [detail]);

  // No sku/brand/updated_at field exists on the product API response yet
  // (only variant color/size/price/stock_quantity) - "Brand" here is the
  // storefront's own fixed brand name, not per-product backend data.
  const jsonLd = useMemo(() => {
    if (!detail) return undefined;
    const url = `${FRONTEND_BASE_URL}/product/${detail.vstitch_product_id}`;
    const prices = detail.variants.map((v) => v.price);
    return [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: detail.product_name,
        description: metaDescription,
        image: images.map((img) => img.image_url),
        category: detail.category_name,
        brand: { "@type": "Brand", name: "VStitch by Anjali Nanda" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: detail.variants.length,
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${FRONTEND_BASE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: detail.category_name,
            item: `${FRONTEND_BASE_URL}/collections/${detail.category_id}`,
          },
          { "@type": "ListItem", position: 3, name: detail.product_name, item: url },
        ],
      },
    ];
  }, [detail, images, inStock, metaDescription]);

  useSeo({
    title: detail ? `${detail.product_name} | VStitch by Anjali Nanda` : undefined,
    description: metaDescription,
    path: detail ? `/product/${detail.vstitch_product_id}` : undefined,
    image: images[0]?.image_url,
    jsonLd,
  });

  const selectColor = (color) => {
    setSelectedColor(color);
    setManualSize(null);
    setQty(1);
  };

  const activeImage = images[activeImageIndex] ?? images[0] ?? null;

  // Wraps around in both directions so swiping/arrow-clicking past the last
  // image loops back to the first, same as the home hero's slide nav.
  const goToImage = useCallback(
    (delta) => {
      if (images.length === 0) return;
      setActiveImageIndex((i) => (i + delta + images.length) % images.length);
      setImgError(false);
    },
    [images.length],
  );

  // Shared by both the gallery button and the lightbox overlay - they swipe
  // to the same next/previous image, so one instance covers both.
  const imageSwipe = useSwipe(
    () => goToImage(1),
    () => goToImage(-1),
  );

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") goToImage(1);
      else if (e.key === "ArrowLeft") goToImage(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goToImage]);

  const addToCart = () => {
    if (!canOrder) return false;
    const requestId = currentCustomRequest?.result?.vstitch_customization_request_id;
    for (let i = 0; i < qty; i += 1) {
      addItem({
        // item.id doubles as vstitch_product_variant_id sent straight to the
        // order API at checkout, so it must stay the real numeric variant id.
        id: selectedVariant.vstitch_product_variant_id,
        productId: detail.vstitch_product_id,
        name: detail.product_name,
        size: selectedVariant.size,
        color: effectiveColor,
        price: selectedVariant.price,
        image: activeImage?.image_url ?? null,
        ...(requestId
          ? { isCustom: true, customizationRequestId: requestId, customMeasurements: currentCustomRequest.values }
          : {}),
      });
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!addToCart()) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!addToCart()) return;
    navigate("/checkout");
  };

  let buttonLabel = "Add to Cart";
  if (!inStock) buttonLabel = "Out of Stock";
  else if (!selectedVariant) buttonLabel = "Select a Size";
  else if (added) buttonLabel = "Added ✓";

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {validId && loading && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-sand-dark/50" />
            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-sand-dark/50" />
              <div className="h-9 w-3/4 animate-pulse rounded bg-sand-dark/50" />
              <div className="h-6 w-24 animate-pulse rounded bg-sand-dark/50" />
              <div className="h-24 w-full animate-pulse rounded bg-sand-dark/50" />
            </div>
          </div>
        )}

        {(!validId || (!loading && error)) && (
          <StateNotice
            title={error ? "Couldn't load this product" : "Product Not Found"}
            description={error || "The product you're looking for doesn't exist or may have been removed."}
            actionLabel="Back to Collections"
            onAction={() => navigate("/collections")}
          />
        )}

        {validId && !loading && !error && detail && (
          <>
            <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs tracking-widest text-charcoal/60 uppercase">
              <Link to="/" className="link-underline">
                Home
              </Link>
              <ChevronRightIcon width="12" height="12" />
              <Link to={`/collections/${detail.category_id}`} className="link-underline">
                {detail.category_name}
              </Link>
              <ChevronRightIcon width="12" height="12" />
              <span className="normal-case text-charcoal">{detail.product_name}</span>
            </nav>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <div className="group relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[1.5rem] bg-sand/50 sm:max-w-xs">
                  <button
                    type="button"
                    onClick={() => activeImage?.image_url && !imgError && setLightboxOpen(true)}
                    onTouchStart={imageSwipe.onTouchStart}
                    onTouchEnd={imageSwipe.onTouchEnd}
                    aria-label="View larger image"
                    className="h-full w-full"
                  >
                    {activeImage?.image_url && !imgError ? (
                      <img
                        src={activeImage.image_url}
                        alt={`${detail.product_name} — ${detail.category_name}, VStitch by Anjali Nanda`}
                        onError={() => setImgError(true)}
                        className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <Swatch
                        tone={getCategoryTone(detail.category_id)}
                        monogram="VN"
                        className="h-full w-full"
                      />
                    )}
                  </button>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() => goToImage(-1)}
                        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-ink/40 p-1.5 text-cream opacity-0 transition-opacity duration-200 hover:bg-ink/60 group-hover:opacity-100 sm:flex"
                      >
                        <ChevronLeftIcon width="16" height="16" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => goToImage(1)}
                        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-ink/40 p-1.5 text-cream opacity-0 transition-opacity duration-200 hover:bg-ink/60 group-hover:opacity-100 sm:flex"
                      >
                        <ChevronRightIcon width="16" height="16" />
                      </button>
                      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                        {images.map((image, index) => (
                          <span
                            key={image.image_url}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              index === activeImageIndex ? "w-5 bg-cream" : "w-1.5 bg-cream/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-4 flex max-w-[280px] gap-3 overflow-x-auto pb-1 sm:max-w-xs">
                    {images.map((image, index) => (
                      <button
                        key={image.image_url}
                        type="button"
                        onClick={() => {
                          setActiveImageIndex(index);
                          setImgError(false);
                        }}
                        className={`h-16 w-[52px] shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                          index === activeImageIndex ? "border-ink" : "border-transparent"
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={`${detail.product_name} view ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                  {detail.category_name}
                </p>
                <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                  {detail.product_name}
                </h1>
                <p className="mt-3 text-xl font-medium text-ink">{priceLabel}</p>

                {detail.description && (
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-charcoal/75">
                    {detail.description}
                  </p>
                )}

                {!inStock && (
                  <p className="mt-4 inline-block bg-ink px-3 py-1 text-xs font-medium tracking-widest text-cream uppercase">
                    Out of Stock
                  </p>
                )}

                {availableColors.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                      Color{effectiveColor ? `: ${effectiveColor}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Color">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          aria-label={color}
                          aria-pressed={effectiveColor === color}
                          onClick={() => selectColor(color)}
                          className={`h-8 w-8 rounded-full border transition-all ${
                            effectiveColor === color
                              ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-cream"
                              : "border-sand-dark hover:border-charcoal"
                          }`}
                          style={{ backgroundColor: colorToHex(color) }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {inStock && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">Size</p>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs font-medium tracking-wide text-ink underline underline-offset-2 hover:text-gold"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {variantsForColor.map((v) => (
                        <button
                          key={v.vstitch_product_variant_id}
                          type="button"
                          disabled={v.stock_quantity <= 0}
                          aria-pressed={!currentCustomRequest && selectedSize === v.size}
                          onClick={() => {
                            setManualSize(v.size);
                            setQty(1);
                          }}
                          className={`min-w-[3rem] border px-3 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                            !currentCustomRequest && selectedSize === v.size
                              ? "border-ink bg-ink text-cream"
                              : "border-sand-dark text-ink hover:border-charcoal"
                          } disabled:cursor-not-allowed disabled:border-sand-dark disabled:bg-sand/40 disabled:text-charcoal/40`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                    {currentCustomRequest && (
                      <p className="mt-2 flex w-fit items-center gap-1.5 border border-gold/60 bg-gold/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink">
                        <CheckCircleIcon width="12" height="12" className="text-gold" />
                        Custom fit requested
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setCustomizeOpen(true)}
                      disabled={!selectedVariant}
                      title={!selectedVariant ? "Select a size to request a custom fit" : undefined}
                      className="mt-3 text-xs font-medium tracking-wide text-ink underline underline-offset-2 hover:text-gold disabled:cursor-not-allowed disabled:text-charcoal/40 disabled:no-underline disabled:hover:text-charcoal/40"
                    >
                      {currentCustomRequest
                        ? "View or edit your custom fit measurements"
                        : "Need a custom fit? Request bespoke measurements"}
                    </button>
                  </div>
                )}

                {canOrder && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/60">Quantity</p>
                    <div className="mt-2 flex w-fit items-center border border-sand-dark">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="flex h-10 w-10 items-center justify-center text-ink disabled:opacity-40"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-ink">{qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                        className="flex h-10 w-10 items-center justify-center text-ink disabled:opacity-40"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canOrder}
                    className={`flex flex-1 items-center justify-center gap-2 border py-3.5 text-sm font-medium tracking-[0.14em] uppercase transition-colors ${
                      added
                        ? "border-gold bg-gold text-ink"
                        : "border-ink text-ink hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:border-sand-dark disabled:text-charcoal/40 disabled:hover:bg-transparent"
                    }`}
                  >
                    {added ? <CheckCircleIcon width="16" height="16" /> : <BagIcon width="16" height="16" />}
                    {buttonLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!canOrder}
                    className="flex-1 bg-ink py-3.5 text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-charcoal/40"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="mt-14 border-t border-sand-dark/70 pt-8">
                  <h2 className="font-display text-xl text-ink">Customer Reviews</h2>
                  <p className="mt-2 text-sm text-charcoal/70">
                    No reviews yet — be the first to share how this piece fit and felt.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />

      {lightboxOpen && activeImage?.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
          onClick={closeLightbox}
          onTouchStart={imageSwipe.onTouchStart}
          onTouchEnd={imageSwipe.onTouchEnd}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeLightbox}
            className="absolute right-5 top-5 text-cream/90 transition-colors hover:text-cream"
          >
            <CloseIcon width="28" height="28" />
          </button>

          {images.length > 1 && (
            <p className="absolute left-1/2 top-5 -translate-x-1/2 text-sm font-medium tracking-widest text-cream/80">
              {activeImageIndex + 1} / {images.length}
            </p>
          )}

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goToImage(-1);
              }}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 text-cream/80 transition-colors hover:text-cream sm:block"
            >
              <ChevronLeftIcon width="32" height="32" />
            </button>
          )}

          <img
            src={activeImage.image_url}
            alt={detail?.product_name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goToImage(1);
              }}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-cream/80 transition-colors hover:text-cream sm:block"
            >
              <ChevronRightIcon width="32" height="32" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
              {images.map((image, index) => (
                <button
                  key={image.image_url}
                  type="button"
                  aria-label={`Go to image ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                    setImgError(false);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeImageIndex ? "w-6 bg-cream" : "w-1.5 bg-cream/50 hover:bg-cream/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      {customizeOpen && detail && selectedVariant && (
        <CustomizationModal
          productId={detail.vstitch_product_id}
          variantId={selectedVariant.vstitch_product_variant_id}
          productName={detail.product_name}
          token={token}
          onClose={() => setCustomizeOpen(false)}
          initialValues={currentCustomRequest?.values}
          existingRequest={currentCustomRequest?.result}
          onSubmitted={handleCustomizeSubmitted}
        />
      )}
    </div>
  );
}
