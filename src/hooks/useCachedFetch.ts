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
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setWarning(null);

      // Check cache
      let cachedData: CachedData<T> | null = null;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          cachedData = JSON.parse(cached);
          if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            setData(cachedData.data);
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
        // Fall back to any cached data (even expired)
        if (cachedData) {
          setData(cachedData.data);
          setFromCache(true);
          setWarning("⚠️ API unavailable — showing cached data. Rates may be outdated! 🕐");
        } else {
          // Try localStorage one more time for any existing data
          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              const parsed: CachedData<T> = JSON.parse(cached);
              setData(parsed.data);
              setFromCache(true);
              setWarning("⚠️ API unavailable — showing cached data. Rates may be outdated! 🕐");
            } else {
              setError("🚫 API is unavailable and no cached data found. Please try again later! 🔄");
            }
          } catch {
            setError("🚫 API is unavailable and no cached data found. Please try again later! 🔄");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, cacheKey]);

  const refresh = async () => {
    localStorage.removeItem(cacheKey);
    setLoading(true);
    setWarning(null);
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
      // On refresh failure, try to restore from cache
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed: CachedData<T> = JSON.parse(cached);
          setData(parsed.data);
          setFromCache(true);
          setWarning("⚠️ Refresh failed — API seems down. Showing last known data! 🔄");
          setError(null);
        } else {
          setError("🚫 Refresh failed and no cached data available. Try again later! 😕");
        }
      } catch {
        setError("🚫 Refresh failed and no cached data available. Try again later! 😕");
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, warning, fromCache, refresh };
}
