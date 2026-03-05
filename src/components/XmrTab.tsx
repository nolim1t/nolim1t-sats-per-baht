import { useState } from "react";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const XmrTab = () => {
  const { data: btcData, loading: btcLoading, error: btcError, warning: btcWarning, refresh: refreshBtc } =
    useCachedFetch<Record<string, Record<string, number>>>(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb",
      "btc-thb-price"
    );
  const { data: xmrData, loading: xmrLoading, error: xmrError, warning: xmrWarning, refresh: refreshXmr } =
    useCachedFetch<Record<string, Record<string, number>>>(
      "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=thb",
      "xmr-thb-price"
    );

  const [amount, setAmount] = useState("");

  const loading = btcLoading || xmrLoading;
  const error = btcError || xmrError;
  const warning = btcWarning || xmrWarning;

  const satsPerThb = btcData ? Math.round(100_000_000 / btcData.bitcoin.thb) : 0;
  const xmrPriceThb = xmrData ? xmrData.monero.thb : 0;
  const satsPerXmr = satsPerThb && xmrPriceThb ? Math.round(xmrPriceThb * satsPerThb) : 0;

  const fromCache = false; // simplified

  const handleDownloadJSON = () => {
    const json = JSON.stringify({ sats_per_xmr: satsPerXmr }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sats_per_xmr.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const refresh = () => {
    refreshBtc();
    refreshXmr();
  };

  const convertedSats = amount ? Math.round(Number(amount) * satsPerXmr) : null;

  return (
    <div className="space-y-6">
      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {warning && (
        <p className="text-sm px-3 py-2 rounded-md bg-accent text-accent-foreground">
          {warning}
        </p>
      )}

      {btcData && xmrData && (
        <>
          <p className="text-5xl font-mono font-semibold">
            {satsPerXmr.toLocaleString()} sats
          </p>
          <p className="text-xs text-muted-foreground">
            1 XMR = {satsPerXmr.toLocaleString()} satoshis
          </p>
          <p className="text-xs text-muted-foreground">
            (XMR/THB: {xmrPriceThb.toLocaleString()} × sats/THB: {satsPerThb.toLocaleString()})
          </p>

          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground">
              Convert XMR to sats
            </label>
            <Input
              type="number"
              placeholder="Enter XMR amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
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

export default XmrTab;
