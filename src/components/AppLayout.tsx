import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ContextualHotbar } from "@/components/ContextualHotbar";
import { Outlet, useParams } from "react-router-dom";
import { useFinance } from "@/contexts/FinanceContext";

export function AppLayout() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { setActiveBudgetId, activeWorkspace } = useFinance();

  useEffect(() => {
    if (budgetId) {
      setActiveBudgetId(budgetId);
    }
  }, [budgetId, setActiveBudgetId]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {activeWorkspace ? `Şu anki plan: ${activeWorkspace.name}` : 'Kişisel Finans Takip'}
            </h1>
          </header>
          <ContextualHotbar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
