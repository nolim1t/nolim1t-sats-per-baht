import { useState } from "react";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CurrencyTabProps {
  currency: string;
  currencyCode: string;
  apiUrl: string;
  cacheKey: string;
  blockHeight: number | null;
}

const CurrencyTab = ({ currency, currencyCode, apiUrl, cacheKey, blockHeight }: CurrencyTabProps) => {
  const { data, loading, error, warning, fromCache, cacheTimestamp, refresh } =
    useCachedFetch<Record<string, Record<string, number>>>(apiUrl, cacheKey);
  const [amount, setAmount] = useState("");

  const rate = data ? data.bitcoin[currencyCode] : 0;
  const satsPerUnit = rate ? Math.round(100_000_000 / rate) : 0;

  const handleDownloadJSON = () => {
    const key = `sats_per_${currencyCode}`;
    const json = JSON.stringify({ [key]: satsPerUnit }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertedSats = amount ? Math.round(Number(amount) * satsPerUnit) : null;

  return (
    <div className="space-y-6">
      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {warning && (
        <p className="text-sm px-3 py-2 rounded-md bg-accent text-accent-foreground">
          {warning}
        </p>
      )}

      {data && (
        <>
          <p className="text-5xl font-mono font-semibold">
            {satsPerUnit.toLocaleString()} sats
          </p>
          <p className="text-xs text-muted-foreground">
            1 {currency} = {satsPerUnit.toLocaleString()} satoshis
          </p>
          <p className="text-xs text-muted-foreground">
            {fromCache ? "📦 Served from cache" : "🌐 Fresh fetch"}
            {blockHeight && <span> · ⛏️ {blockHeight.toLocaleString()}</span>}
            {cacheTimestamp && (
              <span> · 🕐 {new Date(cacheTimestamp).toLocaleString()}</span>
            )}
          </p>

          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground">
              Convert {currency} to sats
            </label>
            <Input
              type="number"
              placeholder={`Enter ${currency} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
            {convertedSats !== null && Number(amount) > 0 && (
              <p className="text-lg font-mono font-semibold text-foreground">
                {convertedSats.toLocaleString()} sats
              </p>
            )}
          </div>

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
  );
};

export default CurrencyTab;
