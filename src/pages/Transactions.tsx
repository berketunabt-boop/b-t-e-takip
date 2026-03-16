import { useState, useMemo } from "react";
import { useFinance, TransactionCategory } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const categories: TransactionCategory[] = ["Maaş", "Freelance", "Kira", "Market", "Yakıt", "Fatura", "Eğlence", "Sağlık", "Eğitim", "Ulaşım", "Giyim", "Diğer"];

const Transactions = () => {
  const { transactions, addTransaction, removeTransaction } = useFinance();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
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
    if (!amount || !description) return;
    addTransaction({ type, amount: parseFloat(amount), date, category, description, isRecurring });
    setAmount(""); setDescription(""); setIsRecurring(false); setShowForm(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Gelir & Gider Yönetimi</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Yeni İşlem
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Yeni İşlem Ekle</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Gelir</SelectItem>
                    <SelectItem value="expense">Gider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tutar (₺)</Label>
                <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Tarih</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={(v: TransactionCategory) => setCategory(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input placeholder="Açıklama giriniz" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Düzenli mi?</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                  <span className="text-sm text-muted-foreground">{isRecurring ? "Evet" : "Hayır"}</span>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategori filtrele" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
          <ArrowUpDown className="h-4 w-4 mr-1" /> Tarih {sortDir === "desc" ? "↓" : "↑"}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Düzenli</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{format(parseISO(t.date), "dd MMM yyyy", { locale: tr })}</TableCell>
                  <TableCell className="text-sm font-medium">{t.description}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{t.category}</Badge></TableCell>
                  <TableCell className="text-sm">{t.isRecurring ? "✓" : "—"}</TableCell>
                  <TableCell className={`text-right text-sm font-semibold ${t.type === "income" ? "text-foreground" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeTransaction(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
