import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { getProductDetail } from "../lib/catalogApi";
import { formatINR } from "../utils/format";
import { colorToHex } from "../utils/colorSwatch";
import { getCategoryTone } from "../utils/categoryTheme";
import { sortSizes } from "../utils/variants";
import Swatch from "./Swatch";
import { BagIcon, CheckCircleIcon } from "./Icons";

export default function ProductCard({ product, transitionDelay = 0 }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(product.in_stock);
  const [detailError, setDetailError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(product.available_colors?.[0] ?? null);
  // Explicit user pick, if any — the actual selected size (below) falls back
  // to the first in-stock size for the current color when this is unset,
  // computed at render time rather than synced via an effect.
  const [manualSize, setManualSize] = useState(null);
  const [added, setAdded] = useState(false);

  // The backend is on a tier that cold-starts (~30-60s to wake), so this
  // first request usually fails on a cold page load. We don't want the
  // customer to see that: while automatic retries remain, a failure keeps
  // the benign "Loading…" state and bumps `retryTick` so the backoff effect
  // below tries again — `detailError` is only set once the whole cold-start
  // window is exhausted. `force` bypasses the module cache so a retry
  // actually re-hits the network instead of reusing the cached in-flight
  // (and about-to-fail) promise.
  const MAX_AUTO_RETRIES = 5;
  const autoRetriesRef = useRef(0);
  const [retryTick, setRetryTick] = useState(0);

  const fetchDetail = useCallback(
    (force = false) => {
      if (!product.in_stock) return Promise.resolve();
      return getProductDetail(product.vstitch_product_id, { force })
        .then((data) => {
          setDetail(data);
          setDetailError(null);
          setDetailLoading(false);
        })
        .catch((err) => {
          if (autoRetriesRef.current < MAX_AUTO_RETRIES) {
            setRetryTick((n) => n + 1);
          } else {
            setDetailError(err.message);
            setDetailLoading(false);
          }
        });
    },
    [product.vstitch_product_id, product.in_stock],
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Exponential backoff (~2s, 4s, 8s, 16s, 30s — capped) that spans a full
  // cold start. Driven by retryTick, which fetchDetail bumps on each failure
  // while retries remain; each attempt stops the moment the fetch succeeds
  // (detailError/loading cleared, no further tick) or the card unmounts.
  useEffect(() => {
    if (retryTick === 0 || autoRetriesRef.current >= MAX_AUTO_RETRIES) return undefined;
    const delay = Math.min(2000 * 2 ** autoRetriesRef.current, 30000);
    const timer = setTimeout(() => {
      autoRetriesRef.current += 1;
      fetchDetail(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [retryTick, fetchDetail]);

  const retryDetail = () => {
    autoRetriesRef.current = 0;
    setRetryTick(0);
    setDetailLoading(true);
    setDetailError(null);
    fetchDetail(true);
  };

  const selectColor = (color) => {
    setSelectedColor(color);
    setManualSize(null);
  };

  const variantsForColor = useMemo(() => {
    if (!detail) return [];
    const variants = selectedColor
      ? detail.variants.filter((v) => v.color === selectedColor)
      : detail.variants;
    return sortSizes(variants);
  }, [detail, selectedColor]);

  const autoSize = variantsForColor.find((v) => v.stock_quantity > 0)?.size ?? "";
  const selectedSize =
    manualSize && variantsForColor.some((v) => v.size === manualSize) ? manualSize : autoSize;
  const selectedVariant = variantsForColor.find((v) => v.size === selectedSize) ?? null;
  const canAddToCart = product.in_stock && selectedVariant && selectedVariant.stock_quantity > 0;

  const priceLabel =
    product.min_price === product.max_price
      ? formatINR(product.min_price)
      : `From ${formatINR(product.min_price)}`;

  const handleAdd = () => {
    if (!canAddToCart) return;
    addItem({
      id: selectedVariant.vstitch_product_variant_id,
      productId: product.vstitch_product_id,
      name: product.product_name,
      size: selectedVariant.size,
      color: selectedColor,
      price: selectedVariant.price,
      image: product.primary_image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  let buttonLabel = "Add to Cart";
  if (!product.in_stock) buttonLabel = "Out of Stock";
  else if (detailLoading) buttonLabel = "Loading…";
  else if (detailError) buttonLabel = "Unavailable";
  else if (!selectedVariant) buttonLabel = "Select a Size";
  else if (added) buttonLabel = "Added ✓";

  return (
    <article data-reveal className="reveal" style={{ transitionDelay: `${transitionDelay}ms` }}>
      <Link
        to={`/product/${product.vstitch_product_id}`}
        className="relative block aspect-[5/6] overflow-hidden"
      >
        {product.primary_image_url && !imgError ? (
          <img
            src={product.primary_image_url}
            alt={`${product.product_name} — ${product.category_name}, VStitch by Anjali Nanda`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-110"
          />
        ) : (
          <Swatch
            tone={getCategoryTone(product.category_id)}
            monogram="VN"
            className="absolute inset-0 h-full w-full"
          />
        )}
        {!product.in_stock && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-medium tracking-widest text-cream uppercase">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="mt-2 space-y-1.5">
        <p className="text-[9px] tracking-[0.14em] text-charcoal/60 uppercase">
          {product.category_name}
        </p>
        <Link to={`/product/${product.vstitch_product_id}`}>
          <h3 className="font-display text-sm text-ink leading-tight hover:text-gold">
            {product.product_name}
          </h3>
        </Link>
        <p className="font-medium text-xs text-ink">{priceLabel}</p>

        {product.available_colors?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Color">
            {product.available_colors.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={color}
                aria-pressed={selectedColor === color}
                onClick={() => selectColor(color)}
                className={`h-3.5 w-3.5 rounded-full border transition-all ${
                  selectedColor === color
                    ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-cream"
                    : "border-sand-dark hover:border-charcoal"
                }`}
                style={{ backgroundColor: colorToHex(color) }}
              />
            ))}
          </div>
        )}

        {product.in_stock && (
          <select
            value={selectedSize}
            onChange={(e) => setManualSize(e.target.value)}
            disabled={detailLoading || variantsForColor.length === 0}
            aria-label="Size"
            className="w-full border border-sand-dark bg-cream px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-ink focus:border-gold focus:outline-none disabled:opacity-60"
          >
            {detailLoading && <option value="">Loading sizes…</option>}
            {!detailLoading && variantsForColor.length === 0 && (
              <option value="">{detailError ? "Unavailable" : "No sizes for this color"}</option>
            )}
            {!detailLoading &&
              variantsForColor.map((v) => (
                <option
                  key={v.vstitch_product_variant_id}
                  value={v.size}
                  disabled={v.stock_quantity <= 0}
                >
                  {v.size} {v.stock_quantity <= 0 ? "(Out of Stock)" : ""}
                </option>
              ))}
          </select>
        )}

        {detailError && (
          <button
            type="button"
            onClick={retryDetail}
            className="mt-1.5 text-xs text-charcoal/60 underline hover:text-ink"
          >
            Couldn't load sizes — tap to retry
          </button>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAddToCart}
          className={`flex w-full items-center justify-center gap-2 py-1.5 text-[10px] font-medium tracking-[0.14em] uppercase transition-colors ${
            added
              ? "bg-gold text-ink"
              : "bg-ink text-cream hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-charcoal/60"
          }`}
        >
          {added ? <CheckCircleIcon width="14" height="14" /> : <BagIcon width="14" height="14" />}
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}
