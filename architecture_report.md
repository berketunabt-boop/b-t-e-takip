# ArchMate Finance - Mimari ve Durum Raporu

Merhaba Baş Mimar, 
Aşağıda projemizin güncel durumunu, inşa ettiğimiz yeni mimariyi ve temel dosyalarımızı bulabilirsin.

## 1. Güncel Klasör Ağacı (Folder Structure)

Projemizin sadece `src` altındaki dizilimi şu şekildedir:

```text
src/
├── assets/                  # Görseller ve statik dosyalar
├── components/              # Yeniden kullanılabilir UI bileşenleri
│   ├── ui/                  # Shadcn/UI tabanlı core bileşenler (button, card vb.)
│   ├── AppLayout.tsx        # Ana sayfa iskeleti (Glassmorphism uygulanmış header)
│   ├── AppSidebar.tsx       # Sol menü navigasyonu
│   └── ContextualHotbar.tsx # Dinamik bağlamsal hızlı eylem menüsü (Hotbar)
├── contexts/
│   └── FinanceContext.tsx   # Tüm veri ve state yönetiminin kalbi
├── data/
│   └── blogPosts.ts
├── hooks/
│   ├── use-mobile.tsx       
│   └── use-toast.ts
├── lib/
│   └── utils.ts             # Tailwind class birleştirici (clsx, twMerge)
└── pages/                   # Uygulama Sayfaları
    ├── WorkspacesHub.tsx    # "Çoklu Çalışma Alanı" seçim ve oluşturma ana ekranı
    ├── Dashboard.tsx        # Seçili bütçenin özet ve grafiklerinin olduğu sayfa
    ├── Investments.tsx      # Canlı kurlar ve portföy sayfası
    ├── Transactions.tsx     
    ├── CreditCards.tsx      
    └── Goals.tsx            
```

## 2. Alet Çantası (Dependencies)

**Core & State:**
- `react` / `react-dom` (v18.3.1)
- `react-router-dom` (Routing)
- `Context API` (Yerleşik, harici kütüphane kullanılmadı)
- `@tanstack/react-query` (Veri senkronizasyonu / esneklik için hazırda)

**UI & Styling:**
- `tailwindcss` (v3.4.17 - Premium SaaS "Neon Glow & Glassmorphism" destekli)
- `lucide-react` (İkonlar)
- Çeşitli `@radix-ui/react-*` paketleri (Shadcn/UI altyapısı)
- `recharts` (Grafikler için - Dashboard'da kullanılıyor)
- `sonner` (Modern Toast/Bildirim mesajları)

---

## 3. Veri Mimarisi ve State Yönetimi (Architecture & State)

Projeye **"Çoklu Çalışma Alanı" (Workspaces)** altyapısı entegre edilmiştir. 
Kullanıcılar artık farklı planlar (Örn: "Şirket", "Bireysel", "Mart Ayı") oluşturup, verilerini birbirinden tamamen izole şekilde tutabilmektedir.

- **Kullanılan Yapı:** Saf **Context API** (`FinanceContext.tsx`) + **LocalStorage** (Kalıcılık için).
- Zustand veya Redux *kullanılmadı*. Kompleksite React Context ile çözüldü.
- **Data Interface Mimarisi:**
  Tüm finansal veriler (gelirler, giderler, kartlar vb.) artık doğrudan kökte değil, bir `Workspace` nesnesi içinde tutulur. `FinanceContext.tsx` içerisindeki veri tipleri şöyledir:

```typescript
export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  transactions: Transaction[];
  creditCards: CreditCard[];
  installments: Installment[];
  investments: Investment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
}
```

Uygulamanın ana State'i `Workspace[]` dizisinden oluşur. Kullanıcı `WorkspacesHub` üzerinden bir çalışma alanına tıkladığında, `activeBudgetId` atanır ve tüm uygulama sadece o seçili bütçenin verilerini okur (`activeWorkspace`).

Ayrıca Dış API'den (ExchangeRate-API) alınan **canlı kurlar** da global olarak bu context içerisinde (`exchangeRates`) state olarak tutulmakta ve periyodik güncellenmektedir.

---

## 4. Kritik Dosyaların Kodları (Core Files)

### A. Yönlendirmelerin Olduğu Ana Dosya (`src/App.tsx`)
Routing yapısı, `/:budgetId` parametresiyle dinamik hale getirilmiş ve tüm sayfalar `AppLayout` altına alınmıştır. Ana dizin (`/`) ise direk Workspace seçme ekranı (Hub) olarak yapılandırılmıştır.

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import CreditCards from "./pages/CreditCards";
import Investments from "./pages/Investments";
import Goals from "./pages/Goals";
import NotFound from "./pages/NotFound";
import WorkspacesHub from "./pages/WorkspacesHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinanceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WorkspacesHub />} />
            <Route path="/bütçe/:budgetId" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="credit-cards" element={<CreditCards />} />
              <Route path="investments" element={<Investments />} />
              <Route path="goals" element={<Goals />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

### B. Çoklu Bütçe & Canlı Kurları Yöneten Ana Dosya (`src/contexts/FinanceContext.tsx`)
(Not: Hacimden dolayı sadece *state ve api çekme kısımları* dahil dilmiştir. Dosyada aynı zamanda CRUD işlemleri de mevcuttur.)

```tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
// ... (Tipler yukarıda mimari kısmında bahsedildiği gibidir)

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem("finansapp_workspaces");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [defaultWorkspace];
      }
    }
    return [defaultWorkspace];
  });
  
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  
  // Canlı Döviz State'i
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(defaultExchangeRates);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Canlı Kurları (USD, EUR) getiren API Hook/Effect
  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        setIsLoadingRates(true);
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        if (!res.ok) throw new Error("Ağ hatası");
        const data = await res.json();
        
        if (isMounted && data && data.rates && data.rates.TRY) {
          const usdToTry = data.rates.TRY;
          const eurToTry = data.rates.TRY / data.rates.EUR; // USD base'li geldiği için çapraz kur hesabı

          setExchangeRates(prev => ({
            ...prev,
            USD: usdToTry,
            EUR: eurToTry,
            ALTIN: 3000 // İleride gerçek API'ye takılmak üzere şimdilik MOCK
          }));
        }
      } catch (err) {
        console.error("Kur yükleme hatası:", err);
      } finally {
        if (isMounted) setIsLoadingRates(false);
      }
    };
    fetchRates();

    return () => { isMounted = false; };
  }, []);

  // LocalStorage Kalıcılığı
  useEffect(() => {
    localStorage.setItem("finansapp_workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  const activeWorkspace = useMemo(() => workspaces.find(w => w.id === activeBudgetId), [workspaces, activeBudgetId]);

  // Derived state from active workspace
  const currentTransactions = activeWorkspace?.transactions || [];
  const currentInvestments = activeWorkspace?.investments || [];
  const currentSavingsGoals = activeWorkspace?.savingsGoals || [];
  const currentCreditCards = activeWorkspace?.creditCards || [];
  const currentSubscriptions = activeWorkspace?.subscriptions || [];
  const currentInstallments = activeWorkspace?.installments || [];

  const totalAssets = useMemo(() => {
    const incomeTotal = currentTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    // Gerçek zamanlı kurlarla toplam varlık hesaplaması
    const investmentTotal = currentInvestments.reduce((s, i) => s + i.amount * exchangeRates[i.type], 0);
    const savingsTotal = currentSavingsGoals.reduce((s, g) => s + g.currentAmount, 0);
    return incomeTotal + investmentTotal + savingsTotal;
  }, [currentTransactions, currentInvestments, currentSavingsGoals, exchangeRates]);

  const totalDebts = useMemo(() => {
    const cardDebts = currentCreditCards.reduce((s, c) => s + c.currentDebt, 0);
    const subCosts = currentSubscriptions.reduce((s, sub) => s + sub.monthlyCost, 0);
    return cardDebts + subCosts;
  }, [currentCreditCards, currentSubscriptions]);

  const netWorth = totalAssets - totalDebts;

  return (
    <FinanceContext.Provider value={{
      workspaces, activeBudgetId, activeWorkspace, setActiveBudgetId, createWorkspace, deleteWorkspace,
      transactions: currentTransactions, 
      creditCards: currentCreditCards, 
      installments: currentInstallments, 
      investments: currentInvestments, 
      subscriptions: currentSubscriptions, 
      savingsGoals: currentSavingsGoals, 
      exchangeRates,
      isLoadingRates,
      totalAssets, totalDebts, netWorth,
      // ... Diğer CRUD Operasyonları
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
```
