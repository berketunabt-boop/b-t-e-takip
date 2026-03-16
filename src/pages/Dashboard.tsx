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
  const { activeWorkspace, transactions, creditCards, subscriptions } = useFinance();

  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const netTransactions = totalIncome - totalExpense;

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

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <Wallet className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">Çalışma Alanı Bulunamadı</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Finansal verilerinizi ve özet grafiklerinizi görüntüleyebilmek için lütfen sol menüden bir çalışma alanı seçin veya yepyeni bir bütçe planı oluşturun.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Aylık Özet</h2>
        <p className="text-muted-foreground mt-1">Sadece bu çalışma alanı kapsamındaki işlemler görüntülenmektedir.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(34,197,94,0.15)] transition-all duration-500 ease-in-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Toplam Gelir</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">{fmt(totalIncome)}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/30 group-hover:ring-emerald-400/60 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                <TrendingUp className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(239,68,68,0.15)] transition-all duration-500 ease-in-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Toplam Gider</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.2)]">{fmt(totalExpense)}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/30 group-hover:ring-rose-400/60 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-300">
                <TrendingDown className="h-7 w-7 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden group hover:-translate-y-1 ${netTransactions >= 0 ? 'hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.15)]' : 'hover:shadow-[0_10px_30px_-10px_rgba(239,68,68,0.15)]'} transition-all duration-500 ease-in-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl`}>
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${netTransactions >= 0 ? 'cyan-500' : 'rose-500'} to-transparent opacity-70 group-hover:opacity-100 transition-opacity`}></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Net Durum</p>
                <p className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white ${netTransactions >= 0 ? 'to-cyan-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]' : 'to-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.2)]'}`}>
                  {netTransactions > 0 ? "+" : ""}{fmt(netTransactions)}
                </p>
              </div>
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ring-1 transition-all duration-300 ${netTransactions >= 0 ? "bg-cyan-500/10 ring-cyan-500/30 group-hover:ring-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-rose-500/10 ring-rose-500/30 group-hover:ring-rose-400/60 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"}`}>
                <Wallet className={`h-7 w-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${netTransactions >= 0 ? "text-cyan-400" : "text-rose-400"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="group hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.15)] transition-all duration-500 ease-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl overflow-hidden relative">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-6 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] rounded-full"></span>
              Aylık Gelir vs Gider Trendi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-2 sm:px-6 relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(v: number) => [fmt(v), undefined]} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: "rgba(10,15,28,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, boxShadow: '0 0 20px rgba(6,182,212,0.2)', color: "#f8fafc", fontWeight: 500 }} 
                />
                <Bar dataKey="Gelir" fill="#34d399" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Gider" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="group hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(168,85,247,0.15)] transition-all duration-500 ease-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl overflow-hidden relative">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-6 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] rounded-full"></span>
              Kategori Dağılımı (Giderler)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} stroke="none" dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity duration-300 outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v: number) => [fmt(v), 'Harcama']} 
                  contentStyle={{ background: "rgba(10,15,28,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, boxShadow: '0 0 20px rgba(139,92,246,0.2)', color: "#f8fafc", fontWeight: 500 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Daily Chart */}
        <Card className="lg:col-span-2 group hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(14,165,233,0.15)] transition-all duration-500 ease-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl overflow-hidden relative">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-3">
            <CardTitle className="text-base font-semibold text-slate-200">Son 7 Günlük Aktivite</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pt-4 relative z-10">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                <Tooltip 
                  formatter={(v: number) => [fmt(v), undefined]} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: "rgba(10,15,28,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f8fafc", fontSize: 13, boxShadow: '0 0 15px rgba(14,165,233,0.3)' }} 
                />
                <Bar dataKey="Gelir" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Gider" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card className="group hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(249,115,22,0.15)] transition-all duration-500 ease-out border-white/5 hover:border-white/20 bg-[#0a0f1c]/80 backdrop-blur-xl overflow-hidden relative">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-200">
              <AlertCircle className="h-4 w-4 text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.8)]" /> Yaklaşan Ödemeler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 relative z-10">
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
    </div>
  );
};

export default Dashboard;
