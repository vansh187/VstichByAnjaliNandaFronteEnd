import { SORT_OPTIONS } from "../utils/productFilters";
import { ChevronDownIcon } from "./Icons";

export default function ProductFilterBar({
  sortBy,
  onSortChange,
  inStockOnly,
  onInStockChange,
  onClearFilters,
  resultCount,
}) {
  const hasActiveFilters = inStockOnly || sortBy !== "featured";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-sand-dark/70 pb-5">
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort by"
          className="appearance-none border border-sand-dark bg-cream py-2 pl-3 pr-8 text-xs font-medium tracking-[0.1em] text-ink uppercase focus:border-gold focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          width="12"
          height="12"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/60"
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium tracking-[0.1em] text-ink uppercase">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockChange(e.target.checked)}
          className="h-3.5 w-3.5 accent-ink"
        />
        In Stock Only
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-medium tracking-[0.1em] text-charcoal/60 uppercase underline hover:text-ink"
        >
          Clear Filters
        </button>
      )}

      {typeof resultCount === "number" && (
        <span className="ml-auto text-xs text-charcoal/60">
          {resultCount} {resultCount === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
}
