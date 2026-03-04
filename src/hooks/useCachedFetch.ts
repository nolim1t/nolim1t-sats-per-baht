import { useState, useEffect } from "react";

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useCachedFetch<T>(url: string, cacheKey: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Check cache
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed: CachedData<T> = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            setData(parsed.data);
            setFromCache(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Cache read failed, proceed to fetch
      }

      // Fetch fresh data
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result: T = await response.json();

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: result, timestamp: Date.now() } as CachedData<T>)
        );

        setData(result);
        setFromCache(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, cacheKey]);

  const refresh = async () => {
    localStorage.removeItem(cacheKey);
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result: T = await response.json();
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data: result, timestamp: Date.now() } as CachedData<T>)
      );
      setData(result);
      setFromCache(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fromCache, refresh };
}
