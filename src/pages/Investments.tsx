import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, BadgeEuro, Gem, WalletCards } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const Investments = () => {
  const { exchangeRates, isLoadingRates, investments } = useFinance();

  const [calcType, setCalcType] = useState<"USD" | "EUR" | "ALTIN">("USD");
  const [calcAmount, setCalcAmount] = useState("");

  const calcResult = useMemo(() => {
    const amt = parseFloat(calcAmount) || 0;
    return amt * exchangeRates[calcType];
  }, [calcAmount, calcType, exchangeRates]);

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(n);

  const rateCards = [
    { type: "USD" as const, label: "Amerikan Doları", icon: DollarSign, rate: exchangeRates.USD },
    { type: "EUR" as const, label: "Euro", icon: BadgeEuro, rate: exchangeRates.EUR },
    { type: "ALTIN" as const, label: "Gram Altın (Sabit)", icon: Gem, rate: exchangeRates.ALTIN },
  ];

  const portfolioTotal = useMemo(() => {
    return investments.reduce((sum, inv) => sum + (inv.amount * exchangeRates[inv.type]), 0);
  }, [investments, exchangeRates]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Yatırımlar (Döviz & Altın)</h2>

      {/* Portfolio Total Widget */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center relative z-10">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <WalletCards className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider mb-2">Toplam Yatırım Değeri (Portföy)</p>
          {isLoadingRates ? (
            <Skeleton className="h-14 md:h-20 w-48 md:w-80 mx-auto rounded-xl" />
          ) : (
            <h1 className="text-5xl md:text-7xl font-black text-foreground drop-shadow-sm">{fmt(portfolioTotal)}</h1>
          )}
          <p className="text-xs md:text-sm text-muted-foreground mt-6 opacity-80 max-w-md mx-auto">
            Bu değer, eklediğiniz tüm yatırımların (USD, EUR, Altın) cankı kurlar baz alınarak anlık hesaplanan TL karşılığıdır.
          </p>
        </CardContent>
      </Card>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rateCards.map(r => (
          <Card key={r.type}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{r.label}</p>
                  {isLoadingRates && r.type !== 'ALTIN' ? (
                     <Skeleton className="h-8 w-24 mt-1 mb-1 rounded-md" />
                  ) : (
                     <p className="text-2xl font-bold text-foreground">{fmt(r.rate)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Canlı Kur</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                  <r.icon className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio */}
      <Card>
        <CardHeader><CardTitle className="text-base">Yatırım Portföyü</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tür</TableHead>
                <TableHead className="text-right">Miktar</TableHead>
                <TableHead className="text-right">Alış Kuru</TableHead>
                <TableHead className="text-right">Güncel Kur</TableHead>
                <TableHead className="text-right">Güncel Değer</TableHead>
                <TableHead className="text-right">Kar/Zarar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map(inv => {
                const currentValue = inv.amount * exchangeRates[inv.type];
                const buyValue = inv.amount * inv.buyRate;
                const pnl = currentValue - buyValue;
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.type}</TableCell>
                    <TableCell className="text-right">{inv.type === "ALTIN" ? `${inv.amount} gr` : inv.amount.toLocaleString("tr-TR")}</TableCell>
                    <TableCell className="text-right">{fmt(inv.buyRate)}</TableCell>
                    <TableCell className="text-right">{fmt(exchangeRates[inv.type])}</TableCell>
                    <TableCell className="text-right font-semibold">{fmt(currentValue)}</TableCell>
                    <TableCell className={`text-right font-semibold ${pnl >= 0 ? "text-foreground" : "text-destructive"}`}>
                      {pnl >= 0 ? "+" : ""}{fmt(pnl)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Varlık Hesaplayıcı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Döviz / Altın Türü</Label>
              <Select value={calcType} onValueChange={(v: "USD" | "EUR" | "ALTIN") => setCalcType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD (Dolar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="ALTIN">Gram Altın</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Miktar</Label>
              <Input type="number" placeholder="0" value={calcAmount} onChange={e => setCalcAmount(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label>TL Karşılığı</Label>
              <div className="h-10 flex items-center rounded-md border border-input bg-muted px-3">
                <span className="text-lg font-bold text-foreground">{fmt(calcResult)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Investments;
