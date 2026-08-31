import { useCallback, useEffect, useState } from "react";
import { getCollection } from "../lib/catalogApi";

// Loads a collection by slug plus its curated products. The collection
// metadata (name, subtitle, images, …) arrives in the same response as the
// first product page, so it's exposed here alongside the keyset-paginated
// product list. Products are kept in the curated order the admin set — no
// client-side re-sorting — and "Load More" appends the next page.
export function useCollection(slug, { limit = 50 } = {}) {
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Only fetches — busy-state resets belong to the caller (mount effect
  // relies on the initial state above; loadMore/reload set them explicitly
  // since they run from clicks, not an effect).
  const runFetch = useCallback(
    (afterId, replace) =>
      getCollection(slug, { afterId, limit })
        .then((data) => {
          const { products, ...meta } = data;
          setCollection(meta);
          setItems((prev) => (replace ? products.items : [...prev, ...products.items]));
          setCursor(products.next_cursor);
          setHasMore(Boolean(products.has_more));
          setError(null);
          setNotFound(false);
        })
        .catch((err) => {
          // 404 = unknown/inactive slug — a distinct "not found" state the
          // page renders differently from a transient network error.
          if (err.status === 404) setNotFound(true);
          else setError(err.message);
        })
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        }),
    [slug, limit],
  );

  useEffect(() => {
    runFetch(undefined, true);
  }, [runFetch]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    runFetch(cursor, false);
  }, [hasMore, loadingMore, cursor, runFetch]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    runFetch(undefined, true);
  }, [runFetch]);

  return {
    collection,
    items,
    loading,
    loadingMore,
    error,
    notFound,
    hasMore,
    loadMore,
    reload,
  };
}
