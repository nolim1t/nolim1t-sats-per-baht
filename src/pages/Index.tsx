import { useCachedFetch } from "@/hooks/useCachedFetch";

interface CoinGeckoPrice {
  bitcoin: { thb: number };
}

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb";

const Index = () => {
  const { data, loading, error, fromCache, refresh } =
    useCachedFetch<CoinGeckoPrice>(COINGECKO_URL, "btc-thb-price");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">THB → Satoshis</h1>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {data && (
          <>
            <p className="text-5xl font-mono font-semibold">
              {Math.round(100_000_000 / data.bitcoin.thb).toLocaleString()} sats
            </p>
            <p className="text-xs text-muted-foreground">
              1 THB = {Math.round(100_000_000 / data.bitcoin.thb).toLocaleString()} satoshis
            </p>
            <p className="text-sm text-muted-foreground">
              {fromCache ? "Served from cache" : "Fresh fetch"}
            </p>
          </>
        )}

        <button
          onClick={refresh}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Force Refresh
        </button>
      </div>
    </div>
  );
};

export default Index;
