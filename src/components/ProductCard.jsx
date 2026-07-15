import { useCart } from "../hooks/useCart";
import { categoryNameById } from "../data/products";
import { formatINR } from "../utils/format";
import Swatch from "./Swatch";
import { BagIcon } from "./Icons";

export default function ProductCard({ product, transitionDelay = 0 }) {
  const { addItem } = useCart();

  return (
    <article
      data-reveal
      className="reveal group"
      style={{ transitionDelay: `${transitionDelay}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Swatch
          tone={product.tone}
          monogram="VN"
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-medium tracking-widest text-cream uppercase">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              tone: product.tone,
            })
          }
          className="absolute inset-x-3 bottom-3 flex translate-y-14 items-center justify-center gap-2 bg-cream/95 py-3 text-xs font-medium tracking-[0.14em] text-ink uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <BagIcon width="15" height="15" /> Add to Cart
        </button>
      </div>

      <div className="mt-4">
        <p className="text-[11px] tracking-[0.14em] text-charcoal/60 uppercase">
          {categoryNameById(product.categoryId)}
        </p>
        <h3 className="mt-1 font-display text-lg text-ink">{product.name}</h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-medium text-ink">{formatINR(product.price)}</span>
          {product.compareAt && (
            <span className="text-sm text-charcoal/45 line-through">
              {formatINR(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
