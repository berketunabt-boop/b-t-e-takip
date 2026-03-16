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
import { ChevronLeft, Plus, Download, Filter, Trash2, CreditCard, DollarSign, RefreshCw, HandCoins, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';

export const ContextualHotbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { budgetId } = useParams<{ budgetId: string }>();
  const { resetData } = useFinance();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleReset = () => {
    resetData();
    setResetModalOpen(false);
    toast.success('Tüm bütçe verileriniz başarıyla sıfırlandı.', {
      description: 'Finansal verileriniz temizlendi.',
    });
  };

  const handlePlaceholder = (action: string) => {
    toast.info(`${action} özelliği yakında eklenecek.`);
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
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Yeni İşlem Ekle')} className="text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni İşlem Ekle
            </Button>
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
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Yeni Kart Ekle')} className="text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni Kart Ekle
            </Button>
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
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Yeni Yatırım Ekle')} className="text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni Ekle
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Kurları Güncelle')} className="text-xs h-8">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Kurları Güncelle
            </Button>
          </>
        );
        break;

      case 'goals':
        specificActions = (
          <>
            <Button variant="ghost" size="sm" onClick={() => handlePlaceholder('Yeni Hedef Ekle')} className="text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Yeni Hedef
            </Button>
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
    <div className="sticky top-14 z-30 w-full border-b border-border/50 bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center px-4 h-10 gap-2 overflow-x-auto scrollbar-none">
        {actions}
      </div>
    </div>
  );
};
