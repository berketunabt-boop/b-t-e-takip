import { useState, useMemo } from "react";
import { useFinance, TransactionCategory, TransactionType } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowUpDown, WalletCards } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

const categories: TransactionCategory[] = ["Maaş", "Freelance", "Kira", "Market", "Yakıt", "Fatura", "Eğlence", "Sağlık", "Eğitim", "Ulaşım", "Giyim", "Diğer"];

const Transactions = () => {
  const { transactions, addTransaction, removeTransaction } = useFinance();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState<TransactionCategory>("Diğer");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filterCategory !== "all") list = list.filter(t => t.category === filterCategory);
    list.sort((a, b) => sortDir === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    return list;
  }, [transactions, filterCategory, sortDir]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      toast.error("Lütfen tutar ve açıklama alanlarını doldurun.");
      return;
    }
    
    addTransaction({ type, amount: parseFloat(amount), date, category, description, isRecurring });
    
    // Reset form & Notify
    setAmount(""); 
    setDescription(""); 
    setIsRecurring(false); 
    setIsDialogOpen(false);
    toast.success("İşlem başarıyla eklendi.", {
      description: `${description} (${fmt(parseFloat(amount))}) kayıt defterine işlendi.`
    });
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  const isIncome = type === "income";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">İşlem Defteri</h2>
          <p className="text-slate-400 mt-1">Tüm gelir ve gider hareketlerinizi buradan takip edip yönetebilirsiniz.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl border border-white/10 group">
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" /> Yeni İşlem Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl bg-[#0a0f1c]/95 backdrop-blur-3xl border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.15)] text-slate-200 rounded-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Yeni Kayıt
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Sisteme yeni bir gelir veya gider kalemi ekleyerek finansal durumunuzu güncel tutun.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-slate-300 font-medium tracking-wide text-sm">İşlem Türü</Label>
                  <Select value={type} onValueChange={(v: TransactionType) => setType(v)}>
                    <SelectTrigger className={`h-12 bg-background/50 border-white/10 focus:ring-1 transition-colors rounded-xl ${isIncome ? 'focus:ring-emerald-500/50 text-emerald-400' : 'focus:ring-rose-500/50 text-rose-400'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f1c]/95 backdrop-blur-2xl border-white/10 text-slate-200">
                      <SelectItem value="income" className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer">Gelir (Kasa Girişi)</SelectItem>
                      <SelectItem value="expense" className="focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer">Gider (Kasa Çıkışı)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2.5">
                  <Label className="text-slate-300 font-medium tracking-wide text-sm">İşlem Tarihi</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="h-12 bg-background/50 border-white/10 focus-visible:ring-cyan-500/50 text-white rounded-xl" />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 font-medium tracking-wide text-sm">Kategori</Label>
                  <Select value={category} onValueChange={(v: TransactionCategory) => setCategory(v)}>
                    <SelectTrigger className="h-12 bg-background/50 border-white/10 focus:ring-cyan-500/50 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f1c]/95 backdrop-blur-2xl border-white/10 text-slate-200 h-60">
                      {categories.map(c => <SelectItem key={c} value={c} className="focus:bg-cyan-500/10 focus:text-cyan-400 cursor-pointer">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-slate-300 font-medium tracking-wide text-sm">Tutar (₺)</Label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isIncome ? '+' : '-'}
                    </span>
                    <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" required className={`h-12 pl-8 bg-background/50 border-white/10 rounded-xl text-lg font-semibold tracking-wide ${isIncome ? 'focus-visible:ring-emerald-500/50 text-emerald-400' : 'focus-visible:ring-rose-500/50 text-rose-400'}`} />
                  </div>
                </div>

                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-slate-300 font-medium tracking-wide text-sm">Açıklama / Not</Label>
                  <Input placeholder="Örn: Mart ayı ev kirası, Freelance ödemesi..." value={description} onChange={e => setDescription(e.target.value)} required className="h-12 bg-background/50 border-white/10 focus-visible:ring-cyan-500/50 text-white placeholder:text-slate-600 rounded-xl" />
                </div>

                <div className="space-y-2.5 md:col-span-2 border border-white/5 bg-white/[0.02] p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-300 font-medium">Otomatik Tekrar</Label>
                    <p className="text-xs text-slate-500">Bu işlem her ay düzenli olarak tekrarlansın mı?</p>
                  </div>
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} className="data-[state=checked]:bg-cyan-500" />
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-white/5 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-11 px-6">İptal</Button>
                <Button type="submit" className={`h-11 px-8 rounded-xl border-none shadow-lg text-white ${isIncome ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/40' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 hover:shadow-rose-500/40'}`}>
                  Kaydı Ekle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0a0f1c]/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px] h-10 bg-transparent border-none focus:ring-0 text-slate-300">
            <SelectValue placeholder="Kategoriye Göre Filtrele" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0f1c]/95 backdrop-blur-2xl border-white/10 text-slate-200">
            <SelectItem value="all" className="focus:bg-cyan-500/10 focus:text-cyan-400">Tüm Kategoriler</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c} className="focus:bg-cyan-500/10 focus:text-cyan-400">{c}</SelectItem>)}
          </SelectContent>
        </Select>
        
        <div className="w-[1px] h-6 bg-white/10"></div>
        
        <Button variant="ghost" size="sm" onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10">
          <ArrowUpDown className="h-4 w-4 mr-2" /> 
          Tarihe Göre {sortDir === "desc" ? "Yeniden Eskiye" : "Eskiden Yeniye"}
        </Button>
      </div>

      {/* Data Table / List */}
      <Card className="border-white/5 bg-[#0a0f1c]/60 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
             <div className="w-20 h-20 rounded-full bg-slate-900/50 border border-white/5 flex items-center justify-center mb-6 shadow-inner relative">
               <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
               <WalletCards className="w-10 h-10 text-slate-600" />
             </div>
             <h3 className="text-xl font-bold mb-2 text-slate-300">İşlem Bulunamadı</h3>
             <p className="text-slate-500 max-w-sm mx-auto mb-6">
               Şu anda listede gösterecek herhangi bir gelir veya gider kaydı bulunmuyor.
             </p>
             <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 rounded-xl">
               İlk İşlemini Ekle
             </Button>
          </div>
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02] hover:bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-slate-400 font-medium">İşlem Tarihi</TableHead>
                  <TableHead className="py-4 px-6 text-slate-400 font-medium min-w-[200px]">Açıklama</TableHead>
                  <TableHead className="py-4 px-6 text-slate-400 font-medium">Kategori</TableHead>
                  <TableHead className="py-4 px-6 text-slate-400 font-medium">Tekrar</TableHead>
                  <TableHead className="py-4 px-6 text-right text-slate-400 font-medium">Net Tutar</TableHead>
                  <TableHead className="w-14"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => {
                  const isIncomeItem = t.type === "income";
                  return (
                    <TableRow key={t.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <TableCell className="py-4 px-6 text-sm text-slate-300 whitespace-nowrap">{format(parseISO(t.date), "dd MMMM yyyy", { locale: tr })}</TableCell>
                      <TableCell className="py-4 px-6 text-sm font-semibold text-slate-200">{t.description}</TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-medium tracking-wide">
                          {t.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-slate-500">
                        {t.isRecurring ? <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> Düzenli</span> : "—"}
                      </TableCell>
                      <TableCell className={`py-4 px-6 text-right text-base font-bold tracking-wide whitespace-nowrap ${isIncomeItem ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]"}`}>
                        {isIncomeItem ? "+" : "−"}{fmt(t.amount)}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all" onClick={() => removeTransaction(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Transactions;
