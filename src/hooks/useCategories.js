import { useCallback, useEffect, useState } from "react";
import { getCategories } from "../lib/catalogApi";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only fetches — any "start loading" reset belongs to whoever triggers a
  // refetch (mount effect relies on the initial state above; reload() below
  // sets it explicitly since it runs from a click, not an effect).
  const fetchCategories = useCallback(
    (force) =>
      getCategories({ force })
        .then((data) => {
          setCategories(data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    fetchCategories(false);
  }, [fetchCategories]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCategories(true);
  }, [fetchCategories]);

  return { categories, loading, error, reload };
}
