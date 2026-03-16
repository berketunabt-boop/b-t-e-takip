import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

export type TransactionType = "income" | "expense";
export type TransactionCategory =
  | "Maaş" | "Freelance" | "Kira" | "Market" | "Yakıt" | "Fatura"
  | "Eğlence" | "Sağlık" | "Eğitim" | "Ulaşım" | "Giyim" | "Diğer";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: TransactionCategory;
  description: string;
  isRecurring: boolean;
}

export interface CreditCard {
  id: string;
  bankName: string;
  totalLimit: number;
  currentDebt: number;
  statementDate: number;
  dueDate: number;
  color: string;
}

export interface Installment {
  id: string;
  cardId: string;
  description: string;
  totalInstallments: number;
  remainingInstallments: number;
  monthlyAmount: number;
}

export interface Investment {
  id: string;
  type: "USD" | "EUR" | "ALTIN";
  amount: number;
  buyRate: number;
}

export interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  icon: string;
  nextPayment: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

export interface ExchangeRates {
  USD: number;
  EUR: number;
  ALTIN: number;
}

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

interface FinanceContextType {
  workspaces: Workspace[];
  activeBudgetId: string | null;
  activeWorkspace: Workspace | undefined;
  setActiveBudgetId: (id: string | null) => void;
  createWorkspace: (name: string) => void;
  deleteWorkspace: (id: string) => void;

  transactions: Transaction[];
  creditCards: CreditCard[];
  installments: Installment[];
  investments: Investment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  exchangeRates: ExchangeRates;
  
  addTransaction: (t: Omit<Transaction, "id">) => void;
  addCreditCard: (c: Omit<CreditCard, "id">) => void;
  addInstallment: (i: Omit<Installment, "id">) => void;
  addInvestment: (i: Omit<Investment, "id">) => void;
  addSubscription: (s: Omit<Subscription, "id">) => void;
  addSavingsGoal: (g: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (id: string, currentAmount: number) => void;
  removeTransaction: (id: string) => void;
  removeSubscription: (id: string) => void;
  resetData: () => void;
  
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
}

const uid = () => crypto.randomUUID();

const defaultTransactions: Transaction[] = [
  { id: uid(), type: "income", amount: 45000, date: "2026-03-01", category: "Maaş", description: "Mart maaşı", isRecurring: true },
  { id: uid(), type: "expense", amount: 8500, date: "2026-03-02", category: "Kira", description: "Ev kirası", isRecurring: true },
  { id: uid(), type: "expense", amount: 2200, date: "2026-03-05", category: "Market", description: "Haftalık market alışverişi", isRecurring: false },
  { id: uid(), type: "expense", amount: 950, date: "2026-03-06", category: "Yakıt", description: "Araç yakıt", isRecurring: false },
  { id: uid(), type: "expense", amount: 1800, date: "2026-03-07", category: "Fatura", description: "Elektrik + doğalgaz", isRecurring: true },
  { id: uid(), type: "expense", amount: 450, date: "2026-03-08", category: "Eğlence", description: "Sinema & yemek", isRecurring: false },
  { id: uid(), type: "expense", amount: 3200, date: "2026-03-10", category: "Giyim", description: "Bahar alışverişi", isRecurring: false },
  { id: uid(), type: "income", amount: 5000, date: "2026-03-12", category: "Freelance", description: "Web tasarım projesi", isRecurring: false },
  { id: uid(), type: "expense", amount: 750, date: "2026-03-14", category: "Ulaşım", description: "Akbil + taksi", isRecurring: false },
  { id: uid(), type: "expense", amount: 1500, date: "2026-03-15", category: "Sağlık", description: "Diş kontrolü", isRecurring: false },
];

const defaultCreditCards: CreditCard[] = [
  { id: uid(), bankName: "Yapı Kredi", totalLimit: 30000, currentDebt: 12500, statementDate: 15, dueDate: 25, color: "from-blue-600 to-blue-800" },
  { id: uid(), bankName: "Garanti BBVA", totalLimit: 25000, currentDebt: 22000, statementDate: 20, dueDate: 1, color: "from-green-600 to-green-800" },
  { id: uid(), bankName: "İş Bankası", totalLimit: 40000, currentDebt: 8700, statementDate: 10, dueDate: 20, color: "from-purple-600 to-purple-800" },
];

const defaultInstallments: Installment[] = [
  { id: uid(), cardId: defaultCreditCards[0].id, description: "Laptop", totalInstallments: 12, remainingInstallments: 7, monthlyAmount: 2500 },
  { id: uid(), cardId: defaultCreditCards[1].id, description: "Telefon", totalInstallments: 6, remainingInstallments: 3, monthlyAmount: 3500 },
  { id: uid(), cardId: defaultCreditCards[2].id, description: "Mobilya", totalInstallments: 9, remainingInstallments: 9, monthlyAmount: 1800 },
];

const defaultInvestments: Investment[] = [
  { id: uid(), type: "USD", amount: 500, buyRate: 36.20 },
  { id: uid(), type: "EUR", amount: 300, buyRate: 39.50 },
  { id: uid(), type: "ALTIN", amount: 15, buyRate: 3250 },
];

const defaultSubscriptions: Subscription[] = [
  { id: uid(), name: "Netflix", monthlyCost: 149, icon: "🎬", nextPayment: "2026-04-01" },
  { id: uid(), name: "Spotify", monthlyCost: 59, icon: "🎵", nextPayment: "2026-04-05" },
  { id: uid(), name: "YouTube Premium", monthlyCost: 79, icon: "📺", nextPayment: "2026-04-10" },
  { id: uid(), name: "iCloud+", monthlyCost: 39, icon: "☁️", nextPayment: "2026-04-12" },
  { id: uid(), name: "ChatGPT Plus", monthlyCost: 699, icon: "🤖", nextPayment: "2026-04-15" },
];

const defaultSavingsGoals: SavingsGoal[] = [
  { id: uid(), name: "Tatil Fonu", targetAmount: 50000, currentAmount: 22000, icon: "🏖️" },
  { id: uid(), name: "Araba", targetAmount: 800000, currentAmount: 120000, icon: "🚗" },
  { id: uid(), name: "Acil Durum Fonu", targetAmount: 100000, currentAmount: 67000, icon: "🛡️" },
  { id: uid(), name: "Ev Tadilatı", targetAmount: 200000, currentAmount: 45000, icon: "🏠" },
];

const defaultExchangeRates: ExchangeRates = { USD: 38.45, EUR: 41.20, ALTIN: 3480 };

const defaultWorkspaceId = uid();
const defaultWorkspace: Workspace = {
  id: defaultWorkspaceId,
  name: "Kişisel Bütçe",
  createdAt: new Date().toISOString(),
  transactions: defaultTransactions,
  creditCards: defaultCreditCards,
  installments: defaultInstallments,
  investments: defaultInvestments,
  subscriptions: defaultSubscriptions,
  savingsGoals: defaultSavingsGoals,
};

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
  const [exchangeRates] = useState<ExchangeRates>(defaultExchangeRates);

  useEffect(() => {
    localStorage.setItem("finansapp_workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  const activeWorkspace = useMemo(() => workspaces.find(w => w.id === activeBudgetId), [workspaces, activeBudgetId]);

  const updateActiveWorkspace = useCallback((updater: (ws: Workspace) => Workspace) => {
    setWorkspaces(prev => prev.map(ws => ws.id === activeBudgetId ? updater(ws) : ws));
  }, [activeBudgetId]);

  const createWorkspace = useCallback((name: string) => {
    const newWs: Workspace = {
      id: uid(),
      name,
      createdAt: new Date().toISOString(),
      transactions: [],
      creditCards: [],
      installments: [],
      investments: [],
      subscriptions: [],
      savingsGoals: [],
    };
    setWorkspaces(prev => [...prev, newWs]);
  }, []);

  const deleteWorkspace = useCallback((id: string) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    if (activeBudgetId === id) {
      setActiveBudgetId(null);
    }
  }, [activeBudgetId]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    updateActiveWorkspace(ws => ({ ...ws, transactions: [{ ...t, id: uid() }, ...ws.transactions] }));
  }, [updateActiveWorkspace]);

  const addCreditCard = useCallback((c: Omit<CreditCard, "id">) => {
    updateActiveWorkspace(ws => ({ ...ws, creditCards: [...ws.creditCards, { ...c, id: uid() }] }));
  }, [updateActiveWorkspace]);

  const addInstallment = useCallback((i: Omit<Installment, "id">) => {
    updateActiveWorkspace(ws => ({ ...ws, installments: [...ws.installments, { ...i, id: uid() }] }));
  }, [updateActiveWorkspace]);

  const addInvestment = useCallback((i: Omit<Investment, "id">) => {
    updateActiveWorkspace(ws => ({ ...ws, investments: [...ws.investments, { ...i, id: uid() }] }));
  }, [updateActiveWorkspace]);

  const addSubscription = useCallback((s: Omit<Subscription, "id">) => {
    updateActiveWorkspace(ws => ({ ...ws, subscriptions: [...ws.subscriptions, { ...s, id: uid() }] }));
  }, [updateActiveWorkspace]);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, "id">) => {
    updateActiveWorkspace(ws => ({ ...ws, savingsGoals: [...ws.savingsGoals, { ...g, id: uid() }] }));
  }, [updateActiveWorkspace]);

  const updateSavingsGoal = useCallback((id: string, currentAmount: number) => {
    updateActiveWorkspace(ws => ({
      ...ws,
      savingsGoals: ws.savingsGoals.map(g => g.id === id ? { ...g, currentAmount } : g)
    }));
  }, [updateActiveWorkspace]);

  const removeTransaction = useCallback((id: string) => {
    updateActiveWorkspace(ws => ({ ...ws, transactions: ws.transactions.filter(t => t.id !== id) }));
  }, [updateActiveWorkspace]);

  const removeSubscription = useCallback((id: string) => {
    updateActiveWorkspace(ws => ({ ...ws, subscriptions: ws.subscriptions.filter(s => s.id !== id) }));
  }, [updateActiveWorkspace]);

  const resetData = useCallback(() => {
    updateActiveWorkspace(ws => ({
      ...ws,
      transactions: [],
      creditCards: [],
      installments: [],
      investments: [],
      subscriptions: [],
      savingsGoals: [],
    }));
  }, [updateActiveWorkspace]);

  // Derived state from active workspace
  const currentTransactions = activeWorkspace?.transactions || [];
  const currentInvestments = activeWorkspace?.investments || [];
  const currentSavingsGoals = activeWorkspace?.savingsGoals || [];
  const currentCreditCards = activeWorkspace?.creditCards || [];
  const currentSubscriptions = activeWorkspace?.subscriptions || [];
  const currentInstallments = activeWorkspace?.installments || [];

  const totalAssets = useMemo(() => {
    const incomeTotal = currentTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
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
      addTransaction, addCreditCard, addInstallment, addInvestment, addSubscription, addSavingsGoal,
      updateSavingsGoal, removeTransaction, removeSubscription, resetData,
      totalAssets, totalDebts, netWorth,
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
