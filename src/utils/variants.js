// Shared between ProductCard's inline size picker and ProductDetailPage's
// full size selector so both list sizes in the same real-world order
// instead of whatever order the API happens to return.
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE SIZE", "STANDARD"];

export function sortSizes(variants) {
  return [...variants].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.size.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.size.toUpperCase());
    if (ai === -1 && bi === -1) return a.size.localeCompare(b.size);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
