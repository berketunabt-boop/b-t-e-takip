import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { format, parseISO, isBefore, addDays, subDays } from "date-fns";
import { tr } from "date-fns/locale";

const PIE_COLORS = [
  "hsl(220, 70%, 55%)", "hsl(150, 60%, 45%)", "hsl(30, 80%, 55%)",
  "hsl(350, 65%, 55%)", "hsl(270, 55%, 55%)", "hsl(180, 50%, 45%)",
  "hsl(45, 75%, 50%)", "hsl(330, 60%, 50%)", "hsl(200, 60%, 50%)",
  "hsl(100, 50%, 45%)", "hsl(0, 60%, 50%)", "hsl(60, 60%, 45%)",
];

const Dashboard = () => {
  const { transactions, totalAssets, totalDebts, netWorth, creditCards, subscriptions } = useFinance();

  const monthlyData = useMemo(() => {
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    return months.map((name, i) => {
      const monthTx = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getMonth() === i;
      });
      return {
        name,
        Gelir: monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Gider: monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "expense").forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const dailyData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
    return days.map(d => {
      const dateStr = format(d, "yyyy-MM-dd");
      const dayTx = transactions.filter(t => t.date === dateStr);
      return {
        name: format(d, "dd MMM", { locale: tr }),
        Gelir: dayTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Gider: dayTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const twoWeeksLater = addDays(today, 14);
    const items: { name: string; date: string; amount: number; type: string }[] = [];

    creditCards.forEach(c => {
      const dueDay = c.dueDate;
      const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
      if (isBefore(dueDate, twoWeeksLater)) {
        items.push({ name: `${c.bankName} Kredi Kartı`, date: format(dueDate, "dd MMM", { locale: tr }), amount: c.currentDebt, type: "card" });
      }
    });

    subscriptions.forEach(s => {
      const nextDate = parseISO(s.nextPayment);
      if (isBefore(nextDate, twoWeeksLater) && !isBefore(nextDate, today)) {
        items.push({ name: s.name, date: format(nextDate, "dd MMM", { locale: tr }), amount: s.monthlyCost, type: "sub" });
      }
    });

    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [creditCards, subscriptions]);

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Varlıklar</p>
                <p className="text-2xl font-bold text-foreground">{fmt(totalAssets)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Borçlar</p>
                <p className="text-2xl font-bold text-destructive">{fmt(totalDebts)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Durum</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-foreground" : "text-destructive"}`}>{fmt(netWorth)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <Wallet className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Aylık Gelir vs Gider</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="Gelir" fill="hsl(150, 60%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gider" fill="hsl(350, 65%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Harcama Dağılımı</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Son 7 Günlük Aktivite</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Bar dataKey="Gelir" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gider" fill="hsl(330, 60%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Yaklaşan Ödemeler</CardTitle></CardHeader>
        <CardContent>
          {upcomingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Yaklaşan ödeme bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
