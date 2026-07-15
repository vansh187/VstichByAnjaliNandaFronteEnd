import { useCallback, useEffect, useState } from "react";
import { getBestSellers } from "../lib/catalogApi";

export function useBestSellers({ limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [qualifyingCount, setQualifyingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only fetches — busy-state resets belong to the caller (mount effect
  // relies on the initial state above; reload sets them explicitly since it
  // runs from a click, not an effect).
  const runFetch = useCallback(
    () =>
      getBestSellers({ limit })
        .then((data) => {
          setItems(data.items ?? []);
          setQualifyingCount(data.qualifying_count ?? 0);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false)),
    [limit],
  );

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    runFetch();
  }, [runFetch]);

  return { items, qualifyingCount, loading, error, reload };
}
