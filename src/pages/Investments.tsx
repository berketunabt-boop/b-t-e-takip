import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, BadgeEuro, Gem } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Investments = () => {
  const { exchangeRates, investments } = useFinance();

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
    { type: "ALTIN" as const, label: "Gram Altın", icon: Gem, rate: exchangeRates.ALTIN },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Yatırımlar (Döviz & Altın)</h2>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rateCards.map(r => (
          <Card key={r.type}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{r.label}</p>
                  <p className="text-2xl font-bold text-foreground">{fmt(r.rate)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Güncel Kur (Mock)</p>
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
