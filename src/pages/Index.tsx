import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrencyTab from "@/components/CurrencyTab";
import XmrTab from "@/components/XmrTab";
const currencies = [
  {
    id: "thb",
    label: "THB",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb",
    cacheKey: "btc-thb-price",
  },
  {
    id: "eur",
    label: "EUR",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur",
    cacheKey: "btc-eur-price",
  },
  {
    id: "usd",
    label: "USD",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    cacheKey: "btc-usd-price",
  },
];

const BLOCK_CACHE_KEY = "btc-block-height";
const BLOCK_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const Index = () => {
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [blockFetchedAt, setBlockFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    // Check cache first
    try {
      const cached = localStorage.getItem(BLOCK_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < BLOCK_CACHE_DURATION) {
          setBlockHeight(parsed.height);
          setBlockFetchedAt(new Date(parsed.timestamp));
          return;
        }
      }
    } catch {}

    fetch("https://mempool.space/api/blocks/tip/height")
      .then((res) => res.ok ? res.text() : Promise.reject())
      .then((text) => {
        const height = Number(text);
        const now = Date.now();
        setBlockHeight(height);
        setBlockFetchedAt(new Date(now));
        localStorage.setItem(BLOCK_CACHE_KEY, JSON.stringify({ height, timestamp: now }));
      })
      .catch(() => {
        // Fall back to cached data
        try {
          const cached = localStorage.getItem(BLOCK_CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            setBlockHeight(parsed.height);
            setBlockFetchedAt(new Date(parsed.timestamp));
          }
        } catch {}
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm w-full px-4">
        <h1 className="text-4xl font-bold">Currency → Satoshis</h1>
        {blockHeight && (
          <p className="text-xs text-muted-foreground font-mono">
            ⛏️ Block height: {blockHeight.toLocaleString()}
            {blockFetchedAt && (
              <span> · 🕐 {blockFetchedAt.toISOString().slice(0, 16).replace('T', ' ')}</span>
            )}
          </p>
        )}

        <Tabs defaultValue="thb" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {currencies.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="xmr">XMR</TabsTrigger>
          </TabsList>
          {currencies.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              <CurrencyTab
                currency={c.label}
                currencyCode={c.id}
                apiUrl={c.url}
                cacheKey={c.cacheKey}
                blockHeight={blockHeight}
              />
            </TabsContent>
          ))}
          <TabsContent value="xmr">
            <XmrTab blockHeight={blockHeight} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
