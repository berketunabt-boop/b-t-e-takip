import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Plus, Download, Filter, Trash2, RefreshCw, HandCoins, ArrowDownToLine, ArrowUpToLine, BellRing } from 'lucide-react';
import { useFinance, TransactionCategory } from '@/contexts/FinanceContext';
import { toast } from 'sonner';

export const ContextualHotbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { budgetId } = useParams<{ budgetId: string }>();
  const { 
    resetData, addTransaction, addCreditCard, 
    addSubscription, addInvestment, addSavingsGoal 
  } = useFinance();
  
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // Form States
  // Transaction
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txCategory, setTxCategory] = useState<TransactionCategory>("Diğer");
  const [txDesc, setTxDesc] = useState("");
  const [txRecur, setTxRecur] = useState(false);

  // Credit Card
  const [cardBank, setCardBank] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardDebt, setCardDebt] = useState("");

  // Subscription
  const [subName, setSubName] = useState("");
  const [subCost, setSubCost] = useState("");
  const [subIcon, setSubIcon] = useState("📺");

  // Investment
  const [invType, setInvType] = useState<"USD" | "EUR" | "ALTIN">("USD");
  const [invAmount, setInvAmount] = useState("");
  const [invRate, setInvRate] = useState("");

  // Goal
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalIcon, setGoalIcon] = useState("🎯");


  const handleReset = () => {
    resetData();
    setResetModalOpen(false);
    toast.success('Tüm bütçe verileriniz başarıyla sıfırlandı.');
  };

  const handlePlaceholder = (action: string) => {
    toast.info(`${action} özelliği için detaylı sayfa görünümü desteklenmektedir. Şimdilik "Yeni Ekle" işlevlerini kullanabilirsiniz.`);
  };

  // Submit Handlers
  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDesc) return;
    addTransaction({ type: txType, amount: parseFloat(txAmount), date: txDate, category: txCategory, description: txDesc, isRecurring: txRecur });
    setTxModalOpen(false);
    setTxAmount(""); setTxDesc(""); setTxRecur(false);
    toast.success("İşlem başarıyla eklendi.");
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardBank || !cardLimit) return;
    addCreditCard({
      bankName: cardBank,
      totalLimit: parseFloat(cardLimit),
      currentDebt: parseFloat(cardDebt) || 0,
      statementDate: 15,
      dueDate: 25,
      color: "from-slate-600 to-slate-800"
    });
    setCardModalOpen(false);
    setCardBank(""); setCardLimit(""); setCardDebt("");
    toast.success("Kredi kartı başarıyla eklendi.");
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subCost) return;
    addSubscription({
      name: subName,
      monthlyCost: parseFloat(subCost),
      icon: subIcon,
      nextPayment: new Date().toISOString().split('T')[0]
    });
    setSubModalOpen(false);
    setSubName(""); setSubCost("");
    toast.success("Abonelik başarıyla eklendi.");
  };

  const handleInvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAmount || !invRate) return;
    addInvestment({
      type: invType,
      amount: parseFloat(invAmount),
      buyRate: parseFloat(invRate)
    });
    setInvModalOpen(false);
    setInvAmount(""); setInvRate("");
    toast.success("Yatırım başarıyla eklendi.");
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;
    addSavingsGoal({
      name: goalName,
      targetAmount: parseFloat(goalTarget),
      currentAmount: parseFloat(goalCurrent) || 0,
      icon: goalIcon
    });
    setGoalModalOpen(false);
    setGoalName(""); setGoalTarget(""); setGoalCurrent("");
    toast.success("Hedef başarıyla eklendi.");
  };

  const renderActions = () => {
    // Sadece /bütçe/ altındaysak çalışsın
    if (!budgetId) return null;

    const subPath = location.pathname.split('/').pop();
    const commonBack = (
      <Button variant="outline" size="sm" onClick={() => navigate('/')} className="text-xs h-8 mr-2 border-primary/20 hover:bg-primary/5">
        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Planlara Dön
      </Button>
    );

    let specificActions = null;

    switch (subPath) {
      case 'dashboard':
      case 'transactions':
      case budgetId: // root of budget
        specificActions = (
          <>
            <Dialog open={txModalOpen} onOpenChange={setTxModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni İşlem Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni İşlem Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTxSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tür</Label>
                      <Select value={txType} onValueChange={(v: any) => setTxType(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Gelir</SelectItem>
                          <SelectItem value="expense">Gider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tarih</Label>
                      <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tutar (₺)</Label>
                    <Input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} min="0" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={txCategory} onValueChange={(v: any) => setTxCategory(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Maaş", "Freelance", "Kira", "Market", "Yakıt", "Fatura", "Eğlence", "Sağlık", "Eğitim", "Ulaşım", "Giyim", "Diğer"]
                          .map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Açıklama</Label>
                    <Input value={txDesc} onChange={e => setTxDesc(e.target.value)} required />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch checked={txRecur} onCheckedChange={setTxRecur} />
                    <Label>Düzenli İşlem</Label>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit">Kaydet</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Filtrele')} className="text-xs h-8">
              <Filter className="w-3.5 h-3.5 mr-1.5" /> Filtrele
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('PDF İndir')} className="text-xs h-8">
              <Download className="w-3.5 h-3.5 mr-1.5" /> PDF Olarak İndir
            </Button>
            
            <AlertDialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Ayı / Verileri Sıfırla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tüm bütçe verileriniz silinecektir</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Bütün gelir, gider ve bütçe kalemleriniz kalıcı olarak silinecektir. Emin misiniz?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Evet, Sıfırla
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
        break;

      case 'credit-cards':
        specificActions = (
          <>
            <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni Kart Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Kart Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCardSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Banka / Kart Adı</Label>
                    <Input placeholder="Örn: Garanti Bonus" value={cardBank} onChange={e => setCardBank(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Toplam Limit (₺)</Label>
                    <Input type="number" value={cardLimit} onChange={e => setCardLimit(e.target.value)} required min="0" step="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Güncel Borç Tutarı (₺)</Label>
                    <Input type="number" value={cardDebt} onChange={e => setCardDebt(e.target.value)} min="0" step="0.01" />
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">Renk ve kesim tarihleri sistem tarafından otomatik atanacaktır. Daha sonra düzenleyebilirsiniz.</p>
                  <DialogFooter className="pt-4">
                    <Button type="submit">Kaydet</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Borç Öde')} className="text-xs h-8">
              <HandCoins className="w-3.5 h-3.5 mr-1.5" /> Borç Öde
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Limit Güncelle')} className="text-xs h-8">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Limit Güncelle
            </Button>
          </>
        );
        break;
      
      case 'investments':
        specificActions = (
          <>
            <Dialog open={invModalOpen} onOpenChange={setInvModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Yatırım Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Döviz/Altın Türü</Label>
                    <Select value={invType} onValueChange={(v: any) => setInvType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD (Dolar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="ALTIN">Gram Altın</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Alınan Miktar</Label>
                    <Input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} required min="0" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ortalama Alış Kuru (₺)</Label>
                    <Input type="number" value={invRate} onChange={e => setInvRate(e.target.value)} required min="0" step="0.001" />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit">Kaydet</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Kurları Güncelle')} className="text-xs h-8">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Kurları Güncelle
            </Button>
          </>
        );
        break;

      case 'goals':
        specificActions = (
          <>
            <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni Hedef
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Birikim Hedefi Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGoalSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-[1fr_4fr] gap-4">
                    <div className="space-y-2">
                      <Label>İkon</Label>
                      <Input value={goalIcon} onChange={e => setGoalIcon(e.target.value)} className="text-center text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hedef Adı</Label>
                      <Input placeholder="Örn: Tatil, Araba" value={goalName} onChange={e => setGoalName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hedeflenen Tutar (₺)</Label>
                    <Input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} required min="0" step="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Halihazırda Biriken (₺)</Label>
                    <Input type="number" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} min="0" step="10" />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit">Kaydet</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={subModalOpen} onOpenChange={setSubModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-8 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400">
                  <BellRing className="w-3.5 h-3.5 mr-1.5" /> Abonelik Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Abonelik Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-[1fr_4fr] gap-4">
                    <div className="space-y-2">
                      <Label>İkon</Label>
                      <Input value={subIcon} onChange={e => setSubIcon(e.target.value)} className="text-center text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label>Abonelik Servisi</Label>
                      <Input placeholder="Netflix, Spotify vs." value={subName} onChange={e => setSubName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Aylık Ücret (₺)</Label>
                    <Input type="number" value={subCost} onChange={e => setSubCost(e.target.value)} required min="0" step="1" />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit">Kaydet</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Hedefe Para Ekle')} className="text-xs h-8">
              <ArrowUpToLine className="w-3.5 h-3.5 mr-1.5" /> Para Ekle
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Hedefden Para Çek')} className="text-xs h-8">
              <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" /> Para Çek
            </Button>
          </>
        );
        break;

      default:
        specificActions = null;
    }

    return (
      <div className="flex items-center">
        {commonBack}
        {specificActions && <div className="h-4 w-px bg-border mx-2"></div>}
        {specificActions}
      </div>
    );
  };

  const actions = renderActions();

  if (!actions) return null;

  return (
    <div className="sticky top-16 z-30 w-full border-b border-white/5 bg-background/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] supports-[backdrop-filter]:bg-background/20">
      <div className="flex items-center px-4 h-12 gap-2 overflow-x-auto scrollbar-none">
        {actions}
      </div>
    </div>
  );
};
