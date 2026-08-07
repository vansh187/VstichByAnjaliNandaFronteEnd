// Sorting/color-filtering happen client-side over whatever page of results
// is currently loaded (the backend has no sort/color params) - both are
// derived at render time from `items`, so they stay correct as "Load More"
// appends more pages rather than needing a re-fetch.
export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function sortProducts(items, sortBy) {
  if (sortBy === "price-asc") {
    return [...items].sort((a, b) => a.min_price - b.min_price);
  }
  if (sortBy === "price-desc") {
    return [...items].sort((a, b) => b.min_price - a.min_price);
  }
  return items;
}

export function getAvailableColors(items) {
  const colors = new Set();
  items.forEach((item) => item.available_colors?.forEach((c) => colors.add(c)));
  return [...colors].sort();
}

export function filterByColors(items, selectedColors) {
  if (selectedColors.length === 0) return items;
  return items.filter((item) =>
    item.available_colors?.some((c) => selectedColors.includes(c)),
  );
}
