import { useState } from "react";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CoinGeckoPrice {
  bitcoin: { thb: number };
}

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb";

const Index = () => {
  const { data, loading, error, fromCache, refresh } =
    useCachedFetch<CoinGeckoPrice>(COINGECKO_URL, "btc-thb-price");
  const [thbAmount, setThbAmount] = useState("");

  const satsPerThb = data ? Math.round(100_000_000 / data.bitcoin.thb) : 0;

  const handleDownloadJSON = () => {
    const json = JSON.stringify({ sats_per_thb: satsPerThb }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sats_per_thb.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertedSats = thbAmount ? Math.round(Number(thbAmount) * satsPerThb) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm w-full px-4">
        <h1 className="text-4xl font-bold">THB → Satoshis</h1>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {data && (
          <>
            <p className="text-5xl font-mono font-semibold">
              {satsPerThb.toLocaleString()} sats
            </p>
            <p className="text-xs text-muted-foreground">
              1 THB = {satsPerThb.toLocaleString()} satoshis
            </p>
            <p className="text-sm text-muted-foreground">
              {fromCache ? "Served from cache" : "Fresh fetch"}
            </p>

            {/* Calculator */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-sm font-medium text-foreground">Convert THB to sats</label>
              <Input
                type="number"
                placeholder="Enter THB amount"
                value={thbAmount}
                onChange={(e) => setThbAmount(e.target.value)}
                min="0"
              />
              {convertedSats !== null && Number(thbAmount) > 0 && (
                <p className="text-lg font-mono font-semibold text-foreground">
                  {convertedSats.toLocaleString()} sats
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={refresh} size="sm">
                Force Refresh
              </Button>
              <Button onClick={handleDownloadJSON} variant="outline" size="sm">
                Download JSON
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
};

export default Index;
