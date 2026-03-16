import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ContextualHotbar } from "@/components/ContextualHotbar";
import { Outlet, useParams } from "react-router-dom";
import { useFinance } from "@/contexts/FinanceContext";
import { Hexagon, UserCircle } from "lucide-react";

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
          <header className="h-16 flex items-center justify-between border-b border-white/5 bg-background/40 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:text-cyan-400 transition-colors" />
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 p-1.5 rounded-lg flex items-center justify-center ring-1 ring-cyan-500/30 group-hover:ring-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300">
                  <Hexagon className="h-5 w-5 fill-cyan-500/80 stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
                <h1 className="text-xl font-bold tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 drop-shadow-[0_2px_10px_rgba(59,130,246,0.2)]">
                  {activeWorkspace ? `ArchMate: ${activeWorkspace.name}` : 'ArchMate Finance'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCircle className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300 cursor-pointer" />
            </div>
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
