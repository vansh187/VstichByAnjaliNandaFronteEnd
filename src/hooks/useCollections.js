import { useCallback, useEffect, useState } from "react";
import { getCollections } from "../lib/catalogApi";

// List of curated collections for the "Shop by Season" nav. Pass a `season`
// to filter (SUMMER, WINTER, …); omit it for every collection. The
// unfiltered list is session-cached in catalogApi since the nav mounts on
// every page.
export function useCollections({ season } = {}) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(
    (force) =>
      getCollections({ season, force })
        .then((data) => {
          setCollections(data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false)),
    [season],
  );

  useEffect(() => {
    fetchCollections(false);
  }, [fetchCollections]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCollections(true);
  }, [fetchCollections]);

  return { collections, loading, error, reload };
}
