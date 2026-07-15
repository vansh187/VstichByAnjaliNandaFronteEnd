import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../lib/catalogApi";

export function useProducts({ categoryId, search, inStockOnly, limit = 20 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Only fetches — busy-state resets belong to the caller (mount effect
  // relies on the initial state above; loadMore/reload set them explicitly
  // since they run from clicks, not an effect).
  const runFetch = useCallback(
    (afterId, replace) =>
      getProducts({ categoryId, search, inStockOnly, afterId, limit })
        .then((data) => {
          setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
          setCursor(data.next_cursor);
          setHasMore(Boolean(data.has_more));
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        }),
    [categoryId, search, inStockOnly, limit],
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
    runFetch(undefined, true);
  }, [runFetch]);

  return { items, loading, loadingMore, error, hasMore, loadMore, reload };
}
