import React, { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, LayoutDashboard, Wallet, CreditCard as CreditCardIcon, TrendingDown, FolderPlus } from "lucide-react";
import { toast } from "sonner";

export default function WorkspacesHub() {
  const { workspaces, createWorkspace, deleteWorkspace } = useFinance();
  const navigate = useNavigate();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Lütfen bir bütçe ismi giriniz.");
      return;
    }
    createWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
    setCreateDialogOpen(false);
    toast.success("Bütçe planı başarıyla oluşturuldu.");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-center text-center space-y-8 pt-12 pb-10 min-h-[40vh]">
          <div className="space-y-5 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 drop-shadow-[0_2px_15px_rgba(59,130,246,0.3)] pb-2">
              Finansal Kontrol Merkezi
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Farklı projelere veya aylara ait bütçelerinizi izole bir şekilde yönetin. 
              Modern ve akıllı finansal takiple tüm varlıklarınızın hakimi olun.
            </p>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transform hover:-translate-y-1 transition-all duration-300 rounded-xl border border-white/10 group">
                  <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" /> Yeni Bütçe Planı Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#0a0f1c]/95 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-200 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Yeni Bütçe Planı</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Yeni bütçenize bir isim verin. (Örn: Mart 2026, Kişisel, Şirket Giderleri)
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 py-4">
                  <Input 
                    placeholder="Bütçe Adı" 
                    value={newWorkspaceName} 
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    className="bg-background/50 border-white/10 focus-visible:ring-cyan-500/50 text-white placeholder:text-slate-600 h-11 rounded-xl"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-white/10 hover:bg-white/5 hover:text-white rounded-xl">İptal</Button>
                  <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)] rounded-xl border-none">Oluştur</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl border border-dashed border-white/10 bg-[#0a0f1c]/40 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500 animate-in fade-in zoom-in-95 w-full mx-auto max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="w-24 h-24 rounded-3xl bg-slate-900/50 border border-white/5 flex items-center justify-center mb-6 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
              <FolderPlus className="w-12 h-12 text-slate-700/50 group-hover:text-cyan-500/50 transition-colors duration-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-200 relative z-10">Henüz bir planınız yok</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8 relative z-10">
              Mali durumunuzu kontrol altına almaya başlamak için ilk bütçe planınızı veya çalışma alanınızı oluşturun.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} variant="outline" className="relative z-10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 bg-transparent rounded-xl px-6 h-12">
              Şimdi İlk Planını Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => {
              const incomeTotal = ws.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
              const expenseTotal = ws.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
              
              return (
                <Card key={ws.id} className="group relative border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(6,182,212,0.2)] bg-[#0a0f1c]/80 backdrop-blur-xl cursor-pointer overflow-hidden flex flex-col rounded-2xl animate-in fade-in zoom-in-95">
                  {/* Subtle top border glow on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Clickable Area mapping to budget */}
                  <div 
                    className="absolute inset-0 z-0" 
                    onClick={() => navigate(`/bütçe/${ws.id}`)}
                  />
                  
                  <CardHeader className="pb-4 relative z-10 w-full flex-row justify-between items-start pt-6 px-6">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300">
                        {ws.name}
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-slate-500 font-medium">
                        Oluşturulma: {new Date(ws.createdAt).toLocaleDateString("tr-TR")}
                      </CardDescription>
                    </div>
                    
                    {/* Delete action must be inside a higher z-index element so it doesn't trigger parent Link navigation */}
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 h-9 w-9 -mt-2 -mr-2 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={e => e.stopPropagation()} className="bg-[#0a0f1c]/95 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(244,63,94,0.15)] rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-rose-400 flex items-center gap-2">Bütçeyi Sil</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              "{ws.name}" isimli bütçe planını ve içindeki tüm verileri kalıcı olarak silmek istediğinize <strong className="text-slate-200">emin misiniz?</strong> Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/10 hover:bg-white/5 hover:text-white text-slate-300 bg-transparent rounded-xl">İptal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                deleteWorkspace(ws.id);
                                toast.success("Bütçe silindi.");
                              }} 
                              className="bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border-none rounded-xl"
                            >
                              Evet, Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4 px-6 relative z-10 flex-1 pointer-events-none">
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                        <span className="text-[11px] font-bold opacity-80 uppercase tracking-widest text-emerald-500/70">Toplam Gelir</span>
                        <span className="font-extrabold text-lg text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">₺{incomeTotal.toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 group-hover:bg-rose-500/10 transition-colors">
                        <span className="text-[11px] font-bold opacity-80 uppercase tracking-widest text-rose-500/70">Gider & Borç</span>
                        <span className="font-extrabold text-lg text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]">₺{expenseTotal.toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4 pb-5 px-6 relative z-10 pointer-events-none text-slate-400 flex gap-5 text-sm border-t border-white/5 bg-white/[0.01]">
                     <span className="flex items-center gap-2 font-medium"><LayoutDashboard className="w-[18px] h-[18px] text-cyan-500/70"/> {ws.transactions.length} İşlem</span>
                     <span className="flex items-center gap-2 font-medium"><CreditCardIcon className="w-[18px] h-[18px] text-violet-500/70"/> {ws.creditCards.length} Kart</span>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
