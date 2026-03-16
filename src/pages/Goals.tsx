import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const Goals = () => {
  const { subscriptions, savingsGoals } = useFinance();

  const totalSubCost = subscriptions.reduce((s, sub) => s + sub.monthlyCost, 0);

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Hedefler & Abonelikler</h2>

      {/* Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Abonelikler</CardTitle>
            <span className="text-sm font-semibold text-muted-foreground">
              Aylık Toplam: <span className="text-foreground">{fmt(totalSubCost)}</span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50">
                <span className="text-2xl">{sub.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">Sonraki: {sub.nextPayment}</p>
                </div>
                <span className="text-sm font-bold text-foreground">{fmt(sub.monthlyCost)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Savings Goals */}
      <Card>
        <CardHeader><CardTitle className="text-base">Birikim Hedefleri</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-6">
            {savingsGoals.map(goal => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon}</span>
                      <span className="text-sm font-medium text-foreground">{goal.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={pct} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>%{pct.toFixed(0)} tamamlandı</span>
                      <span>Kalan: {fmt(goal.targetAmount - goal.currentAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
