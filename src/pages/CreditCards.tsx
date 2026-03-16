import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard as CreditCardIcon } from "lucide-react";

const CreditCards = () => {
  const { creditCards, installments } = useFinance();

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Kredi Kartları & Borçlar</h2>

      {/* Credit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => {
          const ratio = (card.currentDebt / card.totalLimit) * 100;
          const isHigh = ratio >= 80;

          return (
            <div key={card.id} className="space-y-3">
              {/* Card Visual */}
              <div className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white shadow-elegant relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium opacity-90">{card.bankName}</span>
                    <CreditCardIcon className="h-6 w-6 opacity-80" />
                  </div>
                  <div className="mb-4">
                    <p className="text-xs opacity-70 mb-1">Güncel Borç</p>
                    <p className="text-2xl font-bold">{fmt(card.currentDebt)}</p>
                  </div>
                  <div className="flex justify-between text-xs opacity-80">
                    <span>Limit: {fmt(card.totalLimit)}</span>
                    <span>Hesap Kesim: {card.statementDate}. gün</span>
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    Son Ödeme: {card.dueDate}. gün
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Limit Kullanımı</span>
                  <span className={isHigh ? "text-destructive font-semibold" : ""}>%{ratio.toFixed(0)}</span>
                </div>
                <Progress
                  value={ratio}
                  className={`h-2 ${isHigh ? "[&>div]:bg-destructive" : ""}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Installments Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Taksitli Harcamalar</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Harcama</TableHead>
                <TableHead>Kart</TableHead>
                <TableHead>Taksit Durumu</TableHead>
                <TableHead className="text-right">Aylık Tutar</TableHead>
                <TableHead className="text-right">Kalan Toplam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map(inst => {
                const card = creditCards.find(c => c.id === inst.cardId);
                return (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium text-sm">{inst.description}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{card?.bankName || "—"}</Badge></TableCell>
                    <TableCell className="text-sm">
                      <span className="font-semibold">{inst.totalInstallments - inst.remainingInstallments}</span>
                      <span className="text-muted-foreground">/{inst.totalInstallments}</span>
                      <span className="text-xs text-muted-foreground ml-1">({inst.remainingInstallments} kalan)</span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">{fmt(inst.monthlyAmount)}</TableCell>
                    <TableCell className="text-right text-sm text-destructive font-semibold">{fmt(inst.monthlyAmount * inst.remainingInstallments)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditCards;
