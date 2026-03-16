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
import { Plus, Trash2, LayoutDashboard, Wallet, CreditCard as CreditCardIcon, TrendingDown } from "lucide-react";
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bütçe Planlarım</h1>
            <p className="text-muted-foreground mt-1">
              Farklı projelere veya aylara ait bütçelerinizi izole bir şekilde yönetin.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full md:w-auto h-11 px-6">
                <Plus className="w-5 h-5 mr-2" /> Yeni Bütçe Planı Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Bütçe Planı</DialogTitle>
                <DialogDescription>
                  Yeni bütçenize bir isim verin. (Örn: Mart 2026, Kişisel, Şirket Giderleri)
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 py-4">
                <Input 
                  placeholder="Bütçe Adı" 
                  value={newWorkspaceName} 
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>İptal</Button>
                <Button onClick={handleCreate}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Henüz bir bütçe planınız yok</h3>
            <p className="text-muted-foreground max-w-sm">
              Sağ üstteki "Yeni Bütçe Planı Oluştur" butonuna tıklayarak ilk planınızı oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => {
              const incomeTotal = ws.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
              const expenseTotal = ws.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
              
              return (
                <Card key={ws.id} className="group relative border-border/50 hover:border-primary/50 transition-colors shadow-sm cursor-pointer overflow-hidden flex flex-col">
                  {/* Clickable Area mapping to budget */}
                  <div 
                    className="absolute inset-0 z-0" 
                    onClick={() => navigate(`/bütçe/${ws.id}`)}
                  />
                  
                  <CardHeader className="pb-4 relative z-10 w-full flex-row justify-between items-start pt-5">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {ws.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Oluşturulma: {new Date(ws.createdAt).toLocaleDateString("tr-TR")}
                      </CardDescription>
                    </div>
                    
                    {/* Delete action must be inside a higher z-index element so it doesn't trigger parent Link navigation */}
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 -mt-2 -mr-2">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={e => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bütçeyi Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{ws.name}" isimli bütçe planını ve içindeki tüm verileri kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                deleteWorkspace(ws.id);
                                toast.success("Bütçe silindi.");
                              }} 
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Evet, Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3 relative z-10 flex-1 pointer-events-none">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col gap-1 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                        <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Toplam Gelir</span>
                        <span className="font-semibold text-base">₺{incomeTotal.toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                        <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Gider & Borç</span>
                        <span className="font-semibold text-base">₺{expenseTotal.toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3 pb-5 relative z-10 pointer-events-none text-muted-foreground flex gap-4 text-sm border-t border-border/50">
                     <span className="flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4"/> {ws.transactions.length} İşlem</span>
                     <span className="flex items-center gap-1.5"><CreditCardIcon className="w-4 h-4"/> {ws.creditCards.length} Kart</span>
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
