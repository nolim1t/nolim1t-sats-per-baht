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

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm w-full px-4">
        <h1 className="text-4xl font-bold">Currency → Satoshis</h1>

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
              />
            </TabsContent>
          ))}
          <TabsContent value="xmr">
            <XmrTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
