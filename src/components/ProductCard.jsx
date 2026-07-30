import { useCallback, useEffect, useMemo, useState } from "react";
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

  // Only fetches — the "start loading" reset belongs to whoever triggers a
  // refetch (mount effect relies on the initial state above; the retry link
  // sets it explicitly since it runs from a click, not an effect).
  const fetchDetail = useCallback(() => {
    if (!product.in_stock) return Promise.resolve();
    return getProductDetail(product.vstitch_product_id)
      .then((data) => {
        setDetail(data);
        setDetailError(null);
      })
      .catch((err) => setDetailError(err.message))
      .finally(() => setDetailLoading(false));
  }, [product.vstitch_product_id, product.in_stock]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const retryDetail = () => {
    setDetailLoading(true);
    setDetailError(null);
    fetchDetail();
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
            alt={product.product_name}
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
